import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AudioPlayer } from "../components/AudioPlayer";
import { IntervalForm } from "../components/IntervalForm";
import { IntervalList } from "../components/IntervalList";
import { useAudioStore } from "../store/useAudioStore";

export function EditorPage() {
    const navigate = useNavigate();
    const audioFile = useAudioStore((state) => state.audioFile);

    useEffect(() => {
        if (audioFile === null) {
            navigate("/", { replace: true });
        }
    }, [audioFile, navigate]);

    if (audioFile === null) return null;

    return (
        <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
                <div className="flex flex-col gap-8">
                    <AudioPlayer />
                    <IntervalForm />
                    <IntervalList />
                </div>
            </div>
        </main>
    );
}
