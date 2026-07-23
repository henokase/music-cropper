import { useCallback, useState } from "react";
import { Upload, Music, ShieldCheck } from "lucide-react";
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
          toast.success("Audio loaded successfully!");
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
    <div className="mx-auto max-w-xl">
      <label
        htmlFor="audio-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isLoading
            ? "border-amber-500 bg-amber-500/10"
            : isDragOver
              ? "border-amber-500 bg-amber-500/10"
              : "border-border bg-surface hover:border-amber-500/60 hover:bg-surface-hover"
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center py-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/20 border-t-amber-500 mb-3" />
            <p className="text-sm font-semibold text-primary">Loading audio track...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-2">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Upload className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold text-primary">
              Choose an audio file <span className="font-normal text-secondary">or drag & drop</span>
            </p>

            <p className="mt-1 text-xs text-muted">
              MP3, WAV, OGG, M4A, AAC up to 200MB
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

      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        <span>100% Private &mdash; Processes locally in your browser</span>
      </div>
    </div>
  );
}
