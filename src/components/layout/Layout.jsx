import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Upload, AlertTriangle, X } from "lucide-react";
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
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [location.pathname, audioFile]);

  const goHome = () => {
    if (location.pathname === "/editor" && audioFile) {
      if (
        window.confirm("Are you sure you want to leave? All progress will be lost.")
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
      toast.success("Audio file loaded successfully");
    };

    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      toast.error("Error loading audio file");
    };
  };

  const isEditor = location.pathname === "/editor";

  return (
    <div className="relative min-h-screen bg-base text-primary transition-colors duration-300 selection:bg-brand-500/20 selection:text-brand-500">
      {/* Background Decorative Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-gradient-to-tr from-amber-500/10 via-amber-600/5 to-transparent blur-3xl opacity-60 dark:opacity-40 animate-pulse-glow" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-amber-500/10 to-transparent blur-3xl opacity-40 dark:opacity-20" />
      </div>

      {/* Floating Glass Navigation Bar */}
      <header className="sticky top-0 z-40 glass-header">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={goHome}
            className="group flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-glass bg-surface/80 p-2 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:border-amber-500/40 group-hover:shadow-glow-sm">
              <img src={waveIcon} alt="WaveCrop Logo" className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-primary font-sans">
                  WaveCrop
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 ring-1 ring-inset ring-amber-500/20">
                  STUDIO
                </span>
              </div>
              <p className="text-[11px] text-muted -mt-0.5 hidden sm:block">
                Precision Audio Trimmer
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2.5">
            {isEditor && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-xl border border-glass bg-surface/60 px-3.5 py-1.5 text-xs font-semibold text-secondary shadow-sm transition-all duration-200 hover:border-amber-500/40 hover:bg-surface-hover hover:text-primary hover:shadow-glow-sm"
                aria-label="Replace audio"
              >
                <Upload className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden sm:inline">Replace Audio</span>
              </button>
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
      </header>

      {/* Replace Audio Modal Portal (Full Viewport Centered & Full Page Blur) */}
      {isEditor && showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-glass bg-surface p-6 shadow-card-glass-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted transition-colors hover:bg-surface-hover hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-primary">
              Replace current audio?
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-secondary">
              Loading a new audio file will reset your ongoing workspace and clear all created intervals. This operation cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-surface-hover hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleReplaceConfirm}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-600 hover:to-amber-700 hover:shadow-glow-sm"
              >
                Confirm & Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
