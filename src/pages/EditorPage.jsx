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
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="flex flex-col gap-6">
        <AudioPlayer />
        <IntervalForm />
        <IntervalList />
      </div>
    </main>
  );
}
