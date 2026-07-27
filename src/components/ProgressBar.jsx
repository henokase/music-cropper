import { Loader2 } from "lucide-react";

export function ProgressBar() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-glass bg-surface-hover/80 px-4 py-3 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C8179]/10 text-[#2C8179] ring-1 ring-[#2C8179]/20">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-primary">
            Exporting Audio Clips...
          </span>
          <span className="text-[11px] text-muted">
            Decoding waveforms & compiling output
          </span>
        </div>
      </div>

      {/* Modern Shimmer Line Loader */}
      <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-surface">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-[#2C8179] to-transparent" />
      </div>
    </div>
  );
}
