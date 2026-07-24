import { Trash2, Scissors, Download, Layers, CheckCircle2 } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import { audioBufferToWav } from "../utils/audioUtils";
import JSZip from "jszip";
import { toast } from "sonner";
import { useState } from "react";
import { ProgressBar } from "./ProgressBar";

export function IntervalList() {
  const audioFile = useAudioStore((state) => state.audioFile);
  const intervals = audioFile?.intervals ?? [];
  const removeInterval = useAudioStore((state) => state.removeInterval);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCropAll = async () => {
    if (!audioFile || intervals.length === 0) return;
    try {
      setIsProcessing(true);
      setProgress(0);

      const ac = new AudioContext();
      const url = URL.createObjectURL(audioFile.file);
      const res = await fetch(url);
      URL.revokeObjectURL(url);
      const buf = await ac.decodeAudioData(await res.arrayBuffer());

      const zip = new JSZip();
      for (let i = 0; i < intervals.length; i++) {
        const iv = intervals[i];
        const sp = iv.startTime.split(":").map(Number);
        const ep = iv.endTime.split(":").map(Number);
        const st =
          sp.length === 3
            ? sp[0] * 3600 + sp[1] * 60 + sp[2]
            : sp[0] * 60 + sp[1];
        const et =
          ep.length === 3
            ? ep[0] * 3600 + ep[1] * 60 + ep[2]
            : ep[0] * 60 + ep[1];
        const sr = buf.sampleRate;
        const ss = Math.floor(st * sr);
        const es = Math.floor(et * sr);

        const nb = ac.createBuffer(buf.numberOfChannels, es - ss, sr);
        for (let ch = 0; ch < buf.numberOfChannels; ch++) {
          const cd = buf.getChannelData(ch);
          const nd = nb.getChannelData(ch);
          for (let j = 0; j < es - ss; j++) nd[j] = cd[ss + j];
        }
        zip.file(
          `${audioFile.file.name.split(".")[0]}_${iv.startTime}-${iv.endTime}.wav`,
          await audioBufferToWav(nb),
        );
        setProgress(((i + 1) / intervals.length) * 100);
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const dl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dl;
      a.download = `${audioFile.file.name.split(".")[0]}_all_crops.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dl);
      toast.success("Batch ZIP archive successfully generated & downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Export failed during zip compilation");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCrop = async (interval) => {
    if (!audioFile) return;
    try {
      setIsProcessing(true);
      setProgress(0);

      const ac = new AudioContext();
      const url = URL.createObjectURL(audioFile.file);
      const res = await fetch(url);
      URL.revokeObjectURL(url);
      const buf = await ac.decodeAudioData(await res.arrayBuffer());

      const sp = interval.startTime.split(":").map(Number);
      const ep = interval.endTime.split(":").map(Number);
      const st =
        sp.length === 3
          ? sp[0] * 3600 + sp[1] * 60 + sp[2]
          : sp[0] * 60 + sp[1];
      const et =
        ep.length === 3
          ? ep[0] * 3600 + ep[1] * 60 + ep[2]
          : ep[0] * 60 + ep[1];
      const sr = buf.sampleRate;
      const ss = Math.floor(st * sr);
      const es = Math.floor(et * sr);

      const nb = ac.createBuffer(buf.numberOfChannels, es - ss, sr);
      for (let ch = 0; ch < buf.numberOfChannels; ch++) {
        const cd = buf.getChannelData(ch);
        const nd = nb.getChannelData(ch);
        for (let j = 0; j < es - ss; j++) nd[j] = cd[ss + j];
      }

      const wav = await audioBufferToWav(nb);
      const dl = URL.createObjectURL(wav);
      const a = document.createElement("a");
      a.href = dl;
      a.download = `${audioFile.file.name.split(".")[0]}_${interval.startTime}-${interval.endTime}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dl);
      toast.success(`WAV clip exported: ${interval.startTime} → ${interval.endTime}`);
    } catch (err) {
      console.error(err);
      toast.error("Audio crop failed");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-glass bg-surface/80 p-6 shadow-card-glass backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between border-b border-glass pb-4">
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
          <button
            onClick={handleCropAll}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2C8179] to-[#2C8179]/70 px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#2C8179]/20 transition-all duration-200 hover:from-[#2C8179]/80 hover:to-[#2C8179]/70 hover:shadow-glow-sm disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            <span>Export All (ZIP)</span>
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="mb-5 rounded-xl bg-surface-hover/80 p-4 border border-glass">
          <ProgressBar progress={progress} />
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
                  {/* <span>Download WAV</span> */}
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
