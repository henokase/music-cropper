import { Trash2, Scissors, Download } from "lucide-react";
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
      a.download = "cropped_audio.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dl);
      toast.success("All intervals exported");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
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
      toast.success("Interval downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Crop failed");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="rounded-lg border border-light bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-[var(--color-text)]">
          Intervals
          {intervals.length > 0 && (
            <span className="ml-1.5 text-sm text-muted">
              ({intervals.length})
            </span>
          )}
        </h3>
        {intervals.length > 1 && (
          <button
            onClick={handleCropAll}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export All
          </button>
        )}
      </div>

      {isProcessing && (
        <div className="mb-4">
          <ProgressBar progress={progress} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {intervals.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted">
            No intervals yet &mdash; drag on the waveform or add one manually
          </p>
        ) : (
          intervals.map((interval) => (
            <div
              key={interval.id}
              className="flex items-center justify-between rounded-md border border-light bg-[var(--color-bg)] px-3.5 py-2.5 transition-colors hover:border-[var(--color-border)]"
            >
              <span className="text-sm font-medium tabular-nums text-secondary">
                {interval.startTime}
                <span className="mx-2 text-muted">&rarr;</span>
                {interval.endTime}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleCrop(interval)}
                  disabled={isProcessing}
                  className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-surface-hover hover:text-[var(--color-text)]"
                  title="Crop & download"
                >
                  <Scissors className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeInterval(interval.id)}
                  disabled={isProcessing}
                  className="flex h-8 w-8 items-center justify-center rounded text-muted transition-colors hover:bg-surface-hover hover:text-[var(--color-danger)]"
                  title="Remove"
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
