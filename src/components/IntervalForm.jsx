import { useState } from "react";
import { useAudioStore } from "../store/useAudioStore";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function IntervalForm() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const audioFile = useAudioStore((state) => state.audioFile);
  const addInterval = useAudioStore((state) => state.addInterval);

  const validateTimeFormat = (time) => {
    return /^([0-9]+):([0-5][0-9])(:([0-5][0-9]))?$/.test(time);
  };

  const convertToSeconds = (time) => {
    const parts = time.split(":").map(Number);
    return parts.length === 3
      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
      : parts[0] * 60 + parts[1];
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
      toast.error("Use mm:ss or h:mm:ss format");
      return;
    }

    const startSeconds = convertToSeconds(startTime);
    const endSeconds = convertToSeconds(endTime);
    const duration = audioFile?.duration || 0;

    if (startSeconds >= endSeconds) {
      toast.error("End must be after start");
      return;
    }

    if (endSeconds > duration) {
      toast.error("Interval exceeds audio duration");
      return;
    }

    addInterval({ startTime, endTime });
    setStartTime("");
    setEndTime("");
    toast.success("Interval added");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-light bg-surface p-5"
    >
      <h3 className="mb-3.5 text-base font-medium text-[var(--color-text)]">
        Add Interval
      </h3>
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="startTime"
            className="mb-1 block text-xs font-medium text-secondary"
          >
            Start
          </label>
          <input
            type="text"
            id="startTime"
            placeholder="0:00"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-light bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-muted transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-ring)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <label
            htmlFor="endTime"
            className="mb-1 block text-xs font-medium text-secondary"
          >
            End
          </label>
          <input
            type="text"
            id="endTime"
            placeholder="0:00"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-md border border-light bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-muted transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-ring)]"
          />
        </div>
        <button
          type="submit"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    </form>
  );
}
