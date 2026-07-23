import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function AudioUploader() {
  const setAudioFile = useAudioStore((state) => state.setAudioFile);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const MAX_FILE_SIZE = 200 * 1024 * 1024;

  const isValidAudioType = (file) => {
    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/x-aac",
    ];
    if (!validTypes.includes(file.type)) {
      const extension = file.name.toLowerCase().split(".").pop();
      const validExtensions = ["mp3", "wav", "ogg", "m4a", "aac"];
      return validExtensions.includes(extension);
    }
    return true;
  };

  const processFile = useCallback(
    async (file) => {
      if (!isValidAudioType(file)) {
        toast.error("Unsupported format. Use MP3, WAV, OGG, M4A, or AAC");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File exceeds 200MB limit");
        return;
      }
      try {
        setIsLoading(true);
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(file);
        audio.src = objectUrl;

        audio.onloadedmetadata = () => {
          URL.revokeObjectURL(objectUrl);
          setAudioFile(file, audio.duration);
          navigate("/editor");
          setIsLoading(false);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          setIsLoading(false);
          toast.error("Error loading audio file");
        };
      } catch {
        setIsLoading(false);
        toast.error("Error processing audio file");
      }
    },
    [setAudioFile, navigate],
  );

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) processFile(file);
      event.target.value = "";
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className="mx-auto mb-16 max-w-xl">
      <label
        htmlFor="audio-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-all duration-200 ${
          isLoading
            ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
            : isDragOver
              ? "border-[var(--color-primary)] bg-[var(--color-primary-subtle)]"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]"
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="mb-3 h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
            <p className="text-base font-medium text-[var(--color-primary)]">
              Loading audio&hellip;
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary-subtle)]">
              <Upload className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <p className="text-base text-secondary">
              <span className="font-medium text-[var(--color-text)]">
                Choose a file
              </span>{" "}
              or drag it here
            </p>
            <p className="mt-1 text-sm text-muted">
              MP3, WAV, OGG, M4A, AAC &mdash; up to 200MB
            </p>
          </div>
        )}
        <input
          id="audio-upload"
          type="file"
          className="hidden"
          accept=".mp3,.wav,.ogg,.m4a,.aac,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,audio/x-aac"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
}
