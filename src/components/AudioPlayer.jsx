import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import { toast } from "sonner";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimeMs(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function AudioPlayer() {
  const audioFile = useAudioStore((state) => state.audioFile);
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const regionsPluginRef = useRef(null);
  const waveformContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hover, setHover] = useState({ visible: false, x: 0, time: 0 });

  const handleRegionCreateRef = useRef(null);
  handleRegionCreateRef.current = (region) => {
    const start = formatTime(region.start);
    const end = formatTime(region.end);
    useAudioStore.getState().addInterval({ startTime: start, endTime: end });
    region.remove();
    toast.success("Interval created");
  };

  const handleMouseMove = useCallback(
    (e) => {
      const container = waveformContainerRef.current;
      const ws = wavesurferRef.current;
      if (!container || !ws || !isReady) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      setHover({ visible: true, x, time: percent * ws.getDuration() });
    },
    [isReady],
  );

  const handleMouseLeave = useCallback(() => {
    setHover((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!waveformRef.current || !audioFile?.file) return;

    if (wavesurferRef.current) {
      regionsPluginRef.current?.getRegions().forEach((r) => r.remove());
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
      regionsPluginRef.current = null;
    }

    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: cssVar("--color-wavesurfer-wave"),
      progressColor: cssVar("--color-wavesurfer-progress"),
      cursorColor: cssVar("--color-wavesurfer-cursor"),
      height: 112,
      partialRender: false,
      normalize: true,
    });

    const rp = RegionsPlugin.create();
    ws.registerPlugin(rp);
    regionsPluginRef.current = rp;

    rp.enableDragSelection();
    rp.on("region-created", (region) => {
      handleRegionCreateRef.current(region);
    });

    ws.on("ready", () => setIsReady(true));
    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("timeupdate", (time) => setCurrentTime(time));
    ws.on("finish", () => setIsPlaying(false));

    ws.loadBlob(audioFile.file);
    wavesurferRef.current = ws;

    return () => {
      rp?.getRegions().forEach((r) => r.remove());
      ws.destroy();
      wavesurferRef.current = null;
      regionsPluginRef.current = null;
    };
  }, [audioFile?.file]);

  const togglePlayPause = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.playPause();
    }
  };

  const handleVolumeChange = (e) => {
    wavesurferRef.current?.setVolume(parseFloat(e.target.value));
  };

  if (!audioFile) return null;

  return (
    <div className="relative rounded-lg border border-light bg-surface p-5">
      {!isReady && (
        <div className="absolute inset-0 z-10 overflow-hidden rounded-lg">
          <div className="h-full w-full bg-[var(--color-skeleton)]" />
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--color-skeleton-glow)] to-transparent" />
          <div className="absolute top-2.5 bottom-2.5 left-5 right-5">
            <div className="mb-3.5 h-[112px] rounded-md bg-black/[0.07] dark:bg-white/[0.07]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-black/[0.07] dark:bg-white/[0.07]" />
                <div className="h-4 w-28 rounded bg-black/[0.07] dark:bg-white/[0.07]" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-black/[0.07] dark:bg-white/[0.07]" />
                <div className="h-1 w-24 rounded-full bg-black/[0.07] dark:bg-white/[0.07]" />
              </div>
            </div>
            <div className="mt-2.5 h-3 w-56 rounded bg-black/[0.07] dark:bg-white/[0.07]" />
          </div>
        </div>
      )}

      <div className={!isReady ? "opacity-0" : ""}>
        <div
          ref={waveformContainerRef}
          className="relative mb-3.5"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div ref={waveformRef} />
          {hover.visible && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-20"
              style={{ left: hover.x }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5">
                <span className="whitespace-nowrap rounded-md bg-[var(--color-text)] px-2 py-0.5 text-[11px] font-medium tracking-wide text-[var(--color-bg)] shadow-sm">
                  {formatTimeMs(hover.time)}
                </span>
              </div>
              <div className="h-full w-px bg-[var(--color-primary)] opacity-60" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              disabled={!isReady}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-primary)] text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-40"
            >
              {isPlaying ? (
                <Pause className="h-[18px] w-[18px]" />
              ) : (
                <Play className="h-[18px] w-[18px]" />
              )}
            </button>
            <span className="text-sm font-medium tabular-nums text-secondary">
              {formatTime(currentTime)} /{" "}
              {audioFile?.duration ? formatTime(audioFile.duration) : "0:00"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="1"
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>

        {isReady && (
          <p className="mt-2.5 text-xs text-muted">
            Drag across the waveform to create an interval
          </p>
        )}
      </div>
    </div>
  );
}
