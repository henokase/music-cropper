import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProgressBar } from "./ProgressBar";

export function AudioUploader() {
    const setAudioFile = useAudioStore((state) => state.setAudioFile);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

    const isValidAudioType = (file) => {
        // Define accepted MIME types
        const validTypes = [
            'audio/mpeg',           // MP3
            'audio/wav',            // WAV
            'audio/ogg',            // OGG
            'audio/mp4',            // M4A
            'audio/x-m4a',          // M4A (alternative MIME type)
            'audio/aac',            // AAC
            'audio/x-aac'           // AAC (alternative MIME type)
        ];
        
        // Check if file type is in our accepted list
        if (!validTypes.includes(file.type)) {
            // Additional check for files with no MIME type but valid extension
            const extension = file.name.toLowerCase().split('.').pop();
            const validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
            return validExtensions.includes(extension);
        }
        
        return true;
    };

    const handleFileChange = useCallback(
        async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;

            if (!isValidAudioType(file)) {
                toast.error("Unsupported file format. Please use MP3, WAV, OGG, M4A, or AAC");
                event.target.value = "";
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                toast.error("File size exceeds 200MB limit");
                event.target.value = "";
                return;
            }

            try {
                setIsUploading(true);
                setUploadProgress(0);

                const audio = new Audio();
                audio.src = URL.createObjectURL(file);

                const progressInterval = setInterval(() => {
                    setUploadProgress((prev) => Math.min(prev + 10, 90));
                }, 100);

                audio.onloadedmetadata = () => {
                    clearInterval(progressInterval);
                    setUploadProgress(100);
                    setAudioFile(file, audio.duration);
                    navigate('/editor');
                    setIsUploading(false);
                };

                audio.onerror = () => {
                    clearInterval(progressInterval);
                    setIsUploading(false);
                    toast.error(
                        "Error loading audio file. Please try a different file."
                    );
                    event.target.value = "";
                };
            } catch (error) {
                setIsUploading(false);
                console.error("Error handling file:", error);
                toast.error("Error processing audio file");
                event.target.value = "";
            }
        },
        [setAudioFile, navigate]
    );

    return (
        <div className="w-full max-w-4xl mx-auto">
            <label
                htmlFor="audio-upload"
                className="flex flex-col dark:bg-gray-800 dark:border-gray-700 items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold text-indigo-600">
                            Click to upload
                        </span>{" "}
                        or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        MP3, WAV, OGG, M4A or AAC (MAX. 200MB)
                    </p>
                    <p className="mt-2 text-sm text-indigo-600 font-medium">
                        Audio will be ready for cropping
                    </p>
                </div>
                <input
                    id="audio-upload"
                    type="file"
                    className="hidden"
                    accept=".mp3,.wav,.ogg,.m4a,.aac,audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,audio/x-aac"
                    onChange={handleFileChange}
                />
            </label>

            {isUploading && (
                <div className="mt-4">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Uploading...
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {Math.round(uploadProgress)}%
                        </span>
                    </div>
                    <ProgressBar progress={uploadProgress} />
                </div>
            )}
        </div>
    );
} 