import { useState } from "react";
import { useAudioStore } from "../store/useAudioStore";
import { Plus, Clock } from "lucide-react";
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
      toast.error("Invalid format! Use mm:ss or h:mm:ss format (e.g. 0:15)");
      return;
    }

    const startSeconds = convertToSeconds(startTime);
    const endSeconds = convertToSeconds(endTime);
    const duration = audioFile?.duration || 0;

    if (startSeconds >= endSeconds) {
      toast.error("End timestamp must be greater than start timestamp");
      return;
    }

    if (endSeconds > duration) {
      toast.error("Interval timestamp exceeds audio track length");
      return;
    }

    addInterval({ startTime, endTime });
    setStartTime("");
    setEndTime("");
    toast.success(`Created interval ${startTime} → ${endTime}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-2xl border border-glass bg-surface/80 p-6 shadow-card-glass backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2C8179]/10 text-[#2C8179] ring-1 ring-[#2C8179]/20">
            <Clock className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-primary">
            Manual Interval Entry
          </h3>
        </div>
        <span className="text-[11px] text-muted">Format: mm:ss</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-5">
          <label
            htmlFor="startTime"
            className="mb-1.5 block text-xs font-semibold text-secondary"
          >
            Start Timestamp
          </label>
          <input
            type="text"
            id="startTime"
            placeholder="0:00"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-xl border border-glass bg-base px-3.5 py-2 text-sm font-mono text-[var(--color-text)] placeholder-muted transition-all duration-200 focus:border-[#2C8179] focus:outline-none focus:ring-2 focus:ring-[#2C8179]/20"
          />
        </div>

        <div className="sm:col-span-5">
          <label
            htmlFor="endTime"
            className="mb-1.5 block text-xs font-semibold text-secondary"
          >
            End Timestamp
          </label>
          <input
            type="text"
            id="endTime"
            placeholder="1:30"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-xl border border-glass bg-base px-3.5 py-2 text-sm font-mono text-[var(--color-text)] placeholder-muted transition-all duration-200 focus:border-[#2C8179] focus:outline-none focus:ring-2 focus:ring-[#2C8179]/20"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-xl bg-[#2C8179] font-semibold text-slate-950 shadow-md shadow-[#2C8179]/20 transition-all duration-200 hover:bg-[#2C8179]/80 hover:shadow-glow-sm"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            {/* <span className="text-xs">Add</span> */}
          </button>
        </div>
      </div>
    </form>
  );
}
