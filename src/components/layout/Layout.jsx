import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Upload } from "lucide-react";
import { useAudioStore } from "../../store/useAudioStore";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import waveIcon from "../../assets/audio-lines.svg";

const VALID_TYPES = [
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4",
  "audio/x-m4a", "audio/aac", "audio/x-aac",
];
const VALID_EXTS = ["mp3", "wav", "ogg", "m4a", "aac"];
const MAX_SIZE = 200 * 1024 * 1024;

function isValidAudioType(file) {
  if (VALID_TYPES.includes(file.type)) return true;
  return VALID_EXTS.includes(file.name.toLowerCase().split(".").pop());
}

export function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAudio = useAudioStore((state) => state.clearAudio);
  const setAudioFile = useAudioStore((state) => state.setAudioFile);
  const audioFile = useAudioStore((state) => state.audioFile);
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (location.pathname === "/editor" && audioFile) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.pathname, audioFile]);

  const goHome = () => {
    if (location.pathname === "/editor" && audioFile) {
      if (
        window.confirm(
          "Are you sure you want to leave? All progress will be lost.",
        )
      ) {
        clearAudio();
        navigate("/", { replace: true });
      }
    } else {
      navigate("/");
    }
  };

  const handleReplaceConfirm = () => {
    setShowModal(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!isValidAudioType(file)) {
      toast.error("Unsupported format. Use MP3, WAV, OGG, M4A, or AAC");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File exceeds 200MB limit");
      return;
    }

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      setAudioFile(file, audio.duration);
      toast.success("Audio replaced");
    };

    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("Error loading audio file");
    };
  };

  const isEditor = location.pathname === "/editor";

  return (
    <div className="min-h-screen bg-base">
      <nav className="h-16 border-b border-light bg-surface">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
          <button
            onClick={goHome}
            className="flex items-center gap-2.5 text-base font-medium text-secondary transition-colors hover:text-[var(--color-text)]"
          >
            <img src={waveIcon} alt="WaveCrop" className="h-5 w-5" />
            <span>WaveCrop</span>
          </button>

          <div className="flex items-center gap-1">
            {isEditor && (
              <>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-light text-muted transition-colors hover:bg-surface-hover hover:text-[var(--color-text)]"
                  aria-label="Replace audio"
                >
                  <Upload className="h-4 w-4" />
                </button>

                {showModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setShowModal(false)}
                  >
                    <div
                      className="w-full max-w-sm rounded-xl border border-light bg-white p-6 shadow-xl dark:bg-[#1a1715]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)]">
                        <Upload className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-[var(--color-text)]">
                        Replace audio?
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-secondary">
                        This will clear your current audio and all intervals.
                        This action can&rsquo;t be undone.
                      </p>
                      <div className="mt-5 flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setShowModal(false)}
                          className="rounded-md px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-surface-hover hover:text-[var(--color-text)]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleReplaceConfirm}
                          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".mp3,.wav,.ogg,.m4a,.aac,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,audio/x-aac"
              onChange={handleFileChange}
            />

            <ThemeToggle />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
