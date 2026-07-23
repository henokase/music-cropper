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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-6">
        <AudioPlayer />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <IntervalForm />
          </div>
          <div className="lg:col-span-7">
            <IntervalList />
          </div>
        </div>
      </div>
    </main>
  );
}
