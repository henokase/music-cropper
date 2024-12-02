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
    const addInterval = useAudioStore((state) => state.addInterval);

    const handleRegionCreate = (region) => {
        regionsPluginRef.current?.getRegions().forEach((r) => r.remove());
        const start = formatTime(region.start);
        const end = formatTime(region.end);
        addInterval({ startTime: start, endTime: end });
        toast.success("Interval created");
    };

    useEffect(() => {
        if (!waveformRef.current || !audioFile) return;

        // Initialize WaveSurfer
        const wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: "#4F46E5",
            progressColor: "#818CF8",
            cursorColor: "#4F46E5",
            height: 128,
            partialRender: false, // Avoid partial rendering
            normalize: true,
        });

        // Add RegionsPlugin
        const regionsPlugin = RegionsPlugin.create();
        wavesurfer.registerPlugin(regionsPlugin);
        regionsPluginRef.current = regionsPlugin;

        // Enable drag selection
        regionsPlugin.enableDragSelection();
        regionsPlugin.on("region-created", handleRegionCreate);

        // Event Listeners
        wavesurfer.on("ready", () => setIsReady(true));
        wavesurfer.on("play", () => setIsPlaying(true));
        wavesurfer.on("pause", () => setIsPlaying(false));
        wavesurfer.on("timeupdate", (time) => setCurrentTime(time));

        // Load audio file
        wavesurfer.loadBlob(audioFile.file);

        wavesurferRef.current = wavesurfer;

        // Cleanup on unmount
        return () => {
            regionsPlugin?.getRegions().forEach((r) => r.remove());
            wavesurfer.destroy();
            wavesurferRef.current = null;
            regionsPluginRef.current = null;
        };
    }, [audioFile, addInterval]);

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
