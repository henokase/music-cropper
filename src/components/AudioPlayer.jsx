import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { Play, Pause, Volume2 } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import toast from "react-hot-toast";

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatTimePrecise(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

export function AudioPlayer() {
    const audioFile = useAudioStore((state) => state.audioFile);
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const regionsPluginRef = useRef(null);
    const hoverRef = useRef(null);
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

    const handleMouseMove = useCallback((e) => {
        const container = waveformContainerRef.current;
        const ws = wavesurferRef.current;
        if (!container || !ws || !isReady) return;

        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, x / rect.width));
        const duration = ws.getDuration();
        const time = percent * duration;

        setHover({ visible: true, x, time });
    }, [isReady]);

    const handleMouseLeave = useCallback(() => {
        setHover((prev) => ({ ...prev, visible: false }));
    }, []);

    // Initialize WaveSurfer — only when the actual audio file changes
    useEffect(() => {
        if (!waveformRef.current || !audioFile?.file) return;

        if (wavesurferRef.current) {
            regionsPluginRef.current?.getRegions().forEach((r) => r.remove());
            wavesurferRef.current.destroy();
            wavesurferRef.current = null;
            regionsPluginRef.current = null;
        }

        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: "#4F46E5",
            progressColor: "#818CF8",
            cursorColor: "#4F46E5",
            height: 128,
            partialRender: false,
            normalize: true,
        });

        const regionsPlugin = RegionsPlugin.create();
        wavesurfer.registerPlugin(regionsPlugin);
        regionsPluginRef.current = regionsPlugin;

        regionsPlugin.enableDragSelection();
        regionsPlugin.on("region-created", (region) => {
            handleRegionCreateRef.current(region);
        });

        wavesurfer.on("ready", () => setIsReady(true));
        wavesurfer.on("play", () => setIsPlaying(true));
        wavesurfer.on("pause", () => setIsPlaying(false));
        wavesurfer.on("timeupdate", (time) => setCurrentTime(time));
        wavesurfer.on("finish", () => setIsPlaying(false));

        wavesurfer.loadBlob(audioFile.file);

        wavesurferRef.current = wavesurfer;

        return () => {
            regionsPlugin?.getRegions().forEach((r) => r.remove());
            wavesurfer.destroy();
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
        const volume = parseFloat(e.target.value);
        wavesurferRef.current?.setVolume(volume);
    };

    if (!audioFile) return null;

    return (
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div
                ref={waveformContainerRef}
                className="relative mb-4"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {!isReady && (
                    <div className="absolute inset-0 z-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10" />
                    </div>
                )}
                <div ref={waveformRef} className={!isReady ? "opacity-0" : ""} />
                {hover.visible && (
                    <div
                        className="pointer-events-none absolute top-0 bottom-0 z-20"
                        style={{ left: hover.x }}
                    >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5">
                            <span className="inline-block rounded-md bg-gray-900 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white shadow-lg whitespace-nowrap dark:bg-white dark:text-gray-900">
                                {formatTimePrecise(hover.time)}
                            </span>
                        </div>
                        <div className="h-full w-px bg-indigo-500 opacity-70" />
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {!isReady ? (
                        <>
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                        </>
                    ) : (
                        <>
                            <button
                                onClick={togglePlayPause}
                                className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6" />
                                ) : (
                                    <Play className="w-6 h-6" />
                                )}
                            </button>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {formatTime(currentTime)} /{" "}
                                {audioFile?.duration
                                    ? formatTime(audioFile.duration)
                                    : "0:00"}
                            </span>
                        </>
                    )}
                </div>
                {!isReady ? (
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            defaultValue="1"
                            className="w-24"
                            onChange={handleVolumeChange}
                        />
                    </div>
                )}
            </div>
            {!isReady ? (
                <div className="mt-2 h-3 w-64 rounded bg-gray-200 dark:bg-gray-700" />
            ) : (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Tip: Click and drag on the waveform to create intervals
                </p>
            )}
        </div>
    );
}
