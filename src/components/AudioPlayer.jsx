import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { Play, Pause, Volume2, VolumeX, Radio, Music } from "lucide-react";
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hover, setHover] = useState({ visible: false, x: 0, time: 0 });

  const handleRegionCreateRef = useRef(null);
  handleRegionCreateRef.current = (region) => {
    const start = formatTime(region.start);
    const end = formatTime(region.end);
    useAudioStore.getState().addInterval({ startTime: start, endTime: end });
    region.remove();
    toast.success(`Interval added: ${start} → ${end}`);
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
      height: 120,
      partialRender: false,
      normalize: true,
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
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
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
    wavesurferRef.current?.setVolume(val);
  };

  const toggleMute = () => {
    if (!wavesurferRef.current) return;
    if (isMuted) {
      wavesurferRef.current.setVolume(volume || 0.5);
      setIsMuted(false);
    } else {
      wavesurferRef.current.setVolume(0);
      setIsMuted(true);
    }
  };

  if (!audioFile) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-glass bg-surface/80 p-6 shadow-card-glass backdrop-blur-xl">
      {/* Track Title Info Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-glass pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2C8179]/10 text-[#2C8179] ring-1 ring-[#2C8179]/20">
            <Music className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-primary max-w-xs sm:max-w-md">
              {audioFile.file.name}
            </h2>
            <p className="text-xs text-secondary">
              {(audioFile.file.size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
              {audioFile.file.type || "Audio Track"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-surface-hover px-3 py-1.5 border border-glass">
          <Radio className={`h-4 w-4 ${isPlaying ? "text-[#2C8179] animate-pulse" : "text-muted"}`} />
          <span className="text-xs font-mono font-semibold text-secondary">
            {formatTime(currentTime)} / {formatTime(audioFile.duration)}
          </span>
        </div>
      </div>

      {/* Skeleton Loading State */}
      {!isReady && (
        <div className="relative h-[120px] overflow-hidden rounded-xl bg-surface-hover">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--color-skeleton-glow)] to-transparent" />
          <div className="flex h-full items-center justify-center text-xs font-semibold text-muted">
            Loading Waveform Visualization...
          </div>
        </div>
      )}

      {/* Interactive Waveform Container */}
      <div className={!isReady ? "hidden" : "block"}>
        <div
          ref={waveformContainerRef}
          className="relative mb-5 cursor-crosshair rounded-xl bg-surface-hover/50 p-3 border border-glass transition-colors hover:border-[#2C8179]/30"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div ref={waveformRef} />

          {/* Hover Time Tooltip Line */}
          {hover.visible && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-20"
              style={{ left: hover.x }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
                <span className="whitespace-nowrap rounded-lg bg-[#2C8179] px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-md">
                  {formatTimeMs(hover.time)}
                </span>
              </div>
              <div className="h-full w-[2px] bg-[#2C8179] shadow-glow-sm" />
            </div>
          )}
        </div>

        {/* Transport Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              disabled={!isReady}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#2C8179] to-[#2C8179] text-white shadow-md shadow-[#2C8179]/25 transition-all duration-200 hover:scale-105 hover:from-[#2C8179] hover:to-[#2C8179] hover:shadow-glow-md disabled:opacity-40"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>
            
            <div className="flex flex-col">
              <span className="text-xs font-bold text-primary">
                {isPlaying ? "Playing Track" : "Paused"}
              </span>
              <span className="text-[11px] text-muted">
                Drag mouse across waveform to set crop section
              </span>
            </div>
          </div>

          {/* Mute & Volume Slider */}
          <div className="flex items-center gap-2.5 rounded-xl bg-surface-hover/70 px-3.5 py-2 border border-glass">
            <button
              onClick={toggleMute}
              className="text-secondary transition-colors hover:text-[#2C8179]"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-rose-500" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
