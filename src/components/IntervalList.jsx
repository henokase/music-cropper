import { Trash2, Scissors, Download, Layers, Combine, Settings2 } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import { audioBufferToFormat } from "../utils/audioUtils";
import { formatTimestamp, getIntervalSeconds } from "../utils/timeUtils";
import JSZip from "jszip";
import { toast } from "sonner";
import { useState } from "react";
import { ProgressBar } from "./ProgressBar";

function getAudioContextConstructor() {
  return window.AudioContext || window.webkitAudioContext;
}

function getSafeBaseName(fileName) {
  const dotIndex = fileName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  return baseName.replace(/[<>:"/\\|?*]/g, "_").trim() || "audio";
}

function getSafeTimeLabel(time) {
  return time.replace(/[<>:"/\\|?*]/g, "-");
}

async function decodeAudioFile(file) {
  const AudioContextCtor = getAudioContextConstructor();
  if (!AudioContextCtor) {
    throw new Error("Web Audio API is not supported in this browser");
  }

  const audioContext = new AudioContextCtor();
  try {
    const buffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    return { audioContext, buffer };
  } catch (error) {
    await audioContext.close();
    throw error;
  }
}

async function cropBuffer(audioContext, sourceBuffer, interval, format = "mp3") {
  const seconds = getIntervalSeconds(interval);
  if (!seconds) {
    throw new Error(`Invalid interval: ${interval.startTime} to ${interval.endTime}`);
  }

  const sampleRate = sourceBuffer.sampleRate;
  const startSample = Math.max(0, Math.floor(seconds.start * sampleRate));
  const endSample = Math.min(sourceBuffer.length, Math.ceil(seconds.end * sampleRate));

  if (endSample <= startSample) {
    throw new Error(`Invalid interval: ${interval.startTime} to ${interval.endTime}`);
  }

  const frameCount = endSample - startSample;
  const croppedBuffer = audioContext.createBuffer(
    sourceBuffer.numberOfChannels,
    frameCount,
    sampleRate,
  );

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel++) {
    const sourceData = sourceBuffer.getChannelData(channel);
    croppedBuffer.getChannelData(channel).set(sourceData.subarray(startSample, endSample));
  }

  const blob = await audioBufferToFormat(croppedBuffer, format);

  return {
    blob,
    ext: format,
    startTime: formatTimestamp(startSample / sampleRate),
    endTime: formatTimestamp(endSample / sampleRate),
  };
}

function getClipFileName(baseName, clip) {
  return `${baseName}_${getSafeTimeLabel(clip.startTime)}-${getSafeTimeLabel(clip.endTime)}.${clip.ext}`;
}

const yieldToMainThread = () => new Promise((resolve) => setTimeout(resolve, 0));

export function IntervalList() {
  const audioFile = useAudioStore((state) => state.audioFile);
  const intervals = audioFile?.intervals ?? [];
  const removeInterval = useAudioStore((state) => state.removeInterval);
  const exportFormat = useAudioStore((state) => state.exportFormat) || "mp3";
  const setExportFormat = useAudioStore((state) => state.setExportFormat);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropAll = async () => {
    if (!audioFile || intervals.length === 0) return;

    let decoded;
    try {
      setIsProcessing(true);
      await yieldToMainThread();

      decoded = await decodeAudioFile(audioFile.file);
      const baseName = getSafeBaseName(audioFile.file.name);
      const zip = new JSZip();
      const intervalsToExport = [...intervals];

      for (let i = 0; i < intervalsToExport.length; i++) {
        await yieldToMainThread();
        const clip = await cropBuffer(decoded.audioContext, decoded.buffer, intervalsToExport[i], exportFormat);
        zip.file(getClipFileName(baseName, clip), clip.blob);
      }

      await yieldToMainThread();
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const dl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = `${baseName}_all_crops_${exportFormat.toUpperCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dl);
      toast.success(`Batch ZIP archive successfully generated & downloaded (${exportFormat.toUpperCase()})!`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Export failed during zip compilation");
    } finally {
      await decoded?.audioContext.close();
      setIsProcessing(false);
    }
  };

  const handleMergeAndDownload = async () => {
    if (!audioFile || intervals.length === 0) return;

    let decoded;
    try {
      setIsProcessing(true);
      await yieldToMainThread();

      decoded = await decodeAudioFile(audioFile.file);
      const sourceBuffer = decoded.buffer;
      const sampleRate = sourceBuffer.sampleRate;
      const numChannels = sourceBuffer.numberOfChannels;

      const slices = [];
      let totalFrames = 0;

      for (const interval of intervals) {
        const seconds = getIntervalSeconds(interval);
        if (!seconds) continue;

        const startSample = Math.max(0, Math.floor(seconds.start * sampleRate));
        const endSample = Math.min(sourceBuffer.length, Math.ceil(seconds.end * sampleRate));

        if (endSample > startSample) {
          const length = endSample - startSample;
          slices.push({ startSample, endSample, length });
          totalFrames += length;
        }
      }

      if (slices.length === 0 || totalFrames === 0) {
        throw new Error("No valid intervals to merge");
      }

      await yieldToMainThread();

      const mergedBuffer = decoded.audioContext.createBuffer(
        numChannels,
        totalFrames,
        sampleRate,
      );

      for (let ch = 0; ch < numChannels; ch++) {
        const sourceChannel = sourceBuffer.getChannelData(ch);
        const targetChannel = mergedBuffer.getChannelData(ch);
        let writeOffset = 0;

        for (const slice of slices) {
          targetChannel.set(
            sourceChannel.subarray(slice.startSample, slice.endSample),
            writeOffset,
          );
          writeOffset += slice.length;
        }
      }

      await yieldToMainThread();

      const audioBlob = await audioBufferToFormat(mergedBuffer, exportFormat);
      const baseName = getSafeBaseName(audioFile.file.name);
      const dl = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = `${baseName}_merged_${slices.length}_clips.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dl);

      toast.success(`Merged ${slices.length} intervals into a single track (${exportFormat.toUpperCase()})!`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Merging audio intervals failed");
    } finally {
      await decoded?.audioContext.close();
      setIsProcessing(false);
    }
  };

  const handleCrop = async (interval) => {
    if (!audioFile) return;

    let decoded;
    try {
      setIsProcessing(true);

      decoded = await decodeAudioFile(audioFile.file);
      const baseName = getSafeBaseName(audioFile.file.name);
      const clip = await cropBuffer(decoded.audioContext, decoded.buffer, interval, exportFormat);

      const dl = URL.createObjectURL(clip.blob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = getClipFileName(baseName, clip);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dl);
      toast.success(`${exportFormat.toUpperCase()} clip exported: ${clip.startTime} → ${clip.endTime}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Audio crop failed");
    } finally {
      await decoded?.audioContext.close();
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-glass bg-surface/80 p-6 shadow-card-glass backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-4 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C8179]/10 text-[#2C8179] ring-1 ring-[#2C8179]/20">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">
              Cut Intervals
            </h3>
            <p className="text-[11px] text-muted">
              {intervals.length} {intervals.length === 1 ? "clip ready" : "clips queued"}
            </p>
          </div>
        </div>

        {intervals.length > 0 && (
          <div className="flex flex-col-reverse items-end sm:flex-row sm:items-center gap-2.5">
            <div className="max-sm:w-full flex items-center justify-center gap-1.5 rounded-xl border border-glass bg-surface-hover/80 p-1 text-xs">
              <span className="flex items-center gap-1 pl-2 pr-1 font-semibold text-secondary text-[11px]">
                <Settings2 className="h-3.5 w-3.5 text-[#2C8179]" />
                Format:
              </span>
              <button
                type="button"
                onClick={() => setExportFormat("mp3")}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  exportFormat === "mp3"
                    ? "bg-[#2C8179] text-white shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                MP3
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("wav")}
                className={`rounded-lg px-2.5 py-1 font-bold transition-all ${
                  exportFormat === "wav"
                    ? "bg-[#2C8179] text-white shadow-sm"
                    : "text-muted hover:text-primary"
                }`}
              >
                WAV
              </button>
            </div>

            <div className="flex w-full sm:items-center gap-2.5">
              {intervals.length > 1 && (
                <button
                  onClick={handleMergeAndDownload}
                  disabled={isProcessing}
                  className="w-full flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border border-glass bg-surface-hover px-3.5 py-2 text-xs font-bold text-primary transition-all duration-200 hover:border-[#2C8179] hover:bg-[#2C8179]/10 hover:text-[#2C8179] hover:shadow-glow-sm disabled:opacity-40"
                  title="Concatenate all selected intervals into a single seamless audio file"
                >
                  <Combine className="h-4 w-4 text-[#2C8179]" />
                  <span>Merge & Download</span>
                </button>
              )}

              <button
                onClick={handleCropAll}
                disabled={isProcessing}
                className="w-full flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2C8179] to-[#2C8179]/70 px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#2C8179]/20 transition-all duration-200 hover:from-[#2C8179]/80 hover:to-[#2C8179]/70 hover:shadow-glow-sm disabled:opacity-40"
              >
                <Download className="h-4 w-4" />
                <span>Export All (ZIP)</span>
              </button>              
            </div>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="mb-5">
          <ProgressBar />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {intervals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl bg-surface-hover/30 border border-dashed border-glass">
            <p className="text-sm font-semibold text-primary">No intervals added yet</p>
            <p className="mt-1 text-xs text-muted max-w-xs">
              Drag on the waveform player above or use the manual entry form to create your audio cuts.
            </p>
          </div>
        ) : (
          intervals.map((interval, idx) => (
            <div
              key={interval.id}
              className="group flex items-center justify-between rounded-xl border border-glass bg-surface/90 px-4 py-3 shadow-sm transition-all duration-200 hover:border-[#2C8179]/40 hover:bg-surface hover:shadow-glow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2C8179]/10 text-[11px] font-mono font-bold text-[#2C8179]">
                  #{idx + 1}
                </span>
                <span className="text-sm font-mono font-bold text-primary">
                  {interval.startTime}
                  <span className="mx-2 text-[#2C8179]">&rarr;</span>
                  {interval.endTime}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCrop(interval)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 rounded-lg border border-glass bg-surface-hover/60 px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:border-[#2C8179]/40 hover:bg-[#2C8179] hover:text-slate-950 hover:shadow-glow-sm disabled:opacity-40"
                  title="Crop and download WAV clip"
                >
                  <Scissors className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => removeInterval(interval.id)}
                  disabled={isProcessing}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-40"
                  title="Remove interval"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}