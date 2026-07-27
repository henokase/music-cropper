export function parseTimestamp(value) {
  if (typeof value !== "string") return null;

  const parts = value.trim().split(":");
  if (parts.length !== 2 && parts.length !== 3) return null;

  const numbers = parts.map((part) => Number(part));
  if (numbers.some((part) => !Number.isFinite(part) || part < 0)) return null;

  if (parts.length === 2) {
    const [minutes, seconds] = numbers;
    if (seconds >= 60) return null;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = numbers;
  if (minutes >= 60 || seconds >= 60) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatTimestamp(seconds, fractionDigits = 2) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const scale = 10 ** fractionDigits;
  const rounded = Math.round(safeSeconds * scale) / scale;
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const wholeSeconds = Math.floor(rounded % 60);
  const fraction = Math.round((rounded - Math.floor(rounded)) * scale);
  const secondsText = wholeSeconds.toString().padStart(2, "0");

  const base =
    hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secondsText}`
      : `${minutes}:${secondsText}`;

  if (fractionDigits === 0) return base;
  return `${base}.${fraction.toString().padStart(fractionDigits, "0")}`;
}

export function getIntervalSeconds(interval) {
  const start =
    Number.isFinite(interval.startSeconds)
      ? interval.startSeconds
      : parseTimestamp(interval.startTime);
  const end =
    Number.isFinite(interval.endSeconds)
      ? interval.endSeconds
      : parseTimestamp(interval.endTime);

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return { start, end };
}
