export function ProgressBar({ progress }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-semibold text-secondary mb-1.5">
        <span>Processing Audio Export...</span>
        <span className="font-mono text-[#2C8179]">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover border border-glass p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2C8179] to-[#2C8179]/70 shadow-glow-sm transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
