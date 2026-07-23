export function ProgressBar({ progress }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
      <div
        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
