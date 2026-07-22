import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function AudioUploader() {
    const setAudioFile = useAudioStore((state) => state.setAudioFile);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const MAX_FILE_SIZE = 200 * 1024 * 1024;

    const isValidAudioType = (file) => {
        const validTypes = [
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/x-m4a',
            'audio/aac',
            'audio/x-aac'
        ];

        if (!validTypes.includes(file.type)) {
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
                setIsLoading(true);

                const audio = new Audio();
                const objectUrl = URL.createObjectURL(file);
                audio.src = objectUrl;

                audio.onloadedmetadata = () => {
                    URL.revokeObjectURL(objectUrl);
                    setAudioFile(file, audio.duration);
                    navigate('/editor');
                    setIsLoading(false);
                };

                audio.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    setIsLoading(false);
                    toast.error("Error loading audio file. Please try a different file.");
                    event.target.value = "";
                };
            } catch (error) {
                setIsLoading(false);
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
                className={`flex flex-col dark:bg-gray-800 dark:border-gray-700 items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors duration-200 ${
                    isLoading
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 cursor-wait'
                        : 'border-gray-300 cursor-pointer bg-white hover:bg-gray-50'
                }`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    {isLoading ? (
                        <p className="text-sm text-indigo-600 font-medium">
                            Loading audio...
                        </p>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
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