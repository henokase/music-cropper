import { useEffect, useRef, useState } from "react";
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

export function AudioPlayer() {
    const audioFile = useAudioStore((state) => state.audioFile);
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const regionsPluginRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const syncingRef = useRef(false);

    const handleRegionCreateRef = useRef(null);
    handleRegionCreateRef.current = (region) => {
        if (syncingRef.current) return;
        const start = formatTime(region.start);
        const end = formatTime(region.end);
        useAudioStore.getState().addInterval({ startTime: start, endTime: end });
        toast.success("Interval created");
    };

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

    // Sync regions with intervals — does NOT destroy/recreate WaveSurfer
    useEffect(() => {
        const regionsPlugin = regionsPluginRef.current;
        if (!regionsPlugin || !audioFile) return;

        const currentRegions = regionsPlugin.getRegions();
        const storeIntervalIds = new Set(audioFile.intervals.map((i) => i.id));

        // Remove regions whose intervals were deleted
        for (const region of currentRegions) {
            if (!storeIntervalIds.has(region.id)) {
                region.remove();
            }
        }

        // Parse time string to seconds
        const parseTime = (time) => {
            const parts = time.split(":").map(Number);
            return parts.length === 3
                ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                : parts[0] * 60 + parts[1];
        };

        // Get existing region IDs that are still in the store
        const existingRegionIds = new Set(
            regionsPlugin.getRegions().map((r) => r.id)
        );

        // Add regions for new intervals — flag to prevent region-created handler from re-adding
        syncingRef.current = true;
        for (const interval of audioFile.intervals) {
            if (!existingRegionIds.has(interval.id)) {
                regionsPlugin.addRegion({
                    start: parseTime(interval.startTime),
                    end: parseTime(interval.endTime),
                    id: interval.id,
                    color: "rgba(79, 70, 229, 0.15)",
                });
            }
        }
        syncingRef.current = false;
    }, [audioFile?.intervals]);

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
            <div ref={waveformRef} className="mb-4" />
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={togglePlayPause}
                        disabled={!isReady}
                        className={`p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            !isReady ? "opacity-50 cursor-not-allowed" : ""
                        }`}
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
                </div>
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
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Tip: Click and drag on the waveform to create intervals
            </p>
        </div>
    );
}
