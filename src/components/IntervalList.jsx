import { Trash2, Scissors, Download, Edit2 } from "lucide-react";
import { useAudioStore } from "../store/useAudioStore";
import { audioBufferToWav } from "../utils/audioUtils";
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { ProgressBar } from './ProgressBar';

export function IntervalList() {
    const audioFile = useAudioStore((state) => state.audioFile);
    const intervals = audioFile?.intervals ?? [];
    const removeInterval = useAudioStore((state) => state.removeInterval);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [editTime, setEditTime] = useState({ start: '', end: '' });
    const updateInterval = useAudioStore((state) => state.updateInterval);

    const handleCropAll = async () => {
        if (!audioFile || intervals.length === 0) return;

        try {
            setIsProcessing(true);
            setProgress(0);
            
            const audioContext = new AudioContext();
            const response = await fetch(URL.createObjectURL(audioFile.file));
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const zip = new JSZip();
            
            for (let i = 0; i < intervals.length; i++) {
                const interval = intervals[i];
                const [startMinutes, startSeconds] = interval.startTime.split(':').map(Number);
                const [endMinutes, endSeconds] = interval.endTime.split(':').map(Number);
                
                const startTime = startMinutes * 60 + startSeconds;
                const endTime = endMinutes * 60 + endSeconds;
                
                const sampleRate = audioBuffer.sampleRate;
                const startSample = Math.floor(startTime * sampleRate);
                const endSample = Math.floor(endTime * sampleRate);
                
                const newBuffer = audioContext.createBuffer(
                    audioBuffer.numberOfChannels,
                    (endSample - startSample),
                    sampleRate
                );

                for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                    const channelData = audioBuffer.getChannelData(channel);
                    const newChannelData = newBuffer.getChannelData(channel);
                    for (let i = 0; i < (endSample - startSample); i++) {
                        newChannelData[i] = channelData[startSample + i];
                    }
                }

                const wavBlob = await audioBufferToWav(newBuffer);
                const fileName = `${audioFile.file.name.split('.')[0]}_${interval.startTime}-${interval.endTime}.wav`;
                zip.file(fileName, wavBlob);
                
                setProgress(((i + 1) / intervals.length) * 100);
            }

            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cropped_audio.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('All intervals exported successfully');
        } catch (error) {
            console.error('Error processing audio:', error);
            toast.error('Error processing audio files');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleCrop = async (interval) => {
        if (!audioFile) return;

        try {
            setIsProcessing(true);
            setProgress(0);

            const audioContext = new AudioContext();
            setProgress(10);

            const response = await fetch(URL.createObjectURL(audioFile.file));
            const arrayBuffer = await response.arrayBuffer();
            setProgress(30);

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            setProgress(50);

            const [startMinutes, startSeconds] = interval.startTime.split(':').map(Number);
            const [endMinutes, endSeconds] = interval.endTime.split(':').map(Number);
            
            const startTime = startMinutes * 60 + startSeconds;
            const endTime = endMinutes * 60 + endSeconds;
            
            const sampleRate = audioBuffer.sampleRate;
            const startSample = Math.floor(startTime * sampleRate);
            const endSample = Math.floor(endTime * sampleRate);
            
            const newBuffer = audioContext.createBuffer(
                audioBuffer.numberOfChannels,
                (endSample - startSample),
                sampleRate
            );

            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const channelData = audioBuffer.getChannelData(channel);
                const newChannelData = newBuffer.getChannelData(channel);
                for (let i = 0; i < (endSample - startSample); i++) {
                    newChannelData[i] = channelData[startSample + i];
                }
                setProgress(50 + ((channel + 1) / audioBuffer.numberOfChannels) * 30);
            }

            const wavBlob = await audioBufferToWav(newBuffer);
            setProgress(90);

            const fileName = `${audioFile.file.name.split('.')[0]}_${interval.startTime}-${interval.endTime}.wav`;
            
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setProgress(100);
            toast.success('Interval cropped and downloaded successfully');
        } catch (error) {
            console.error('Error cropping audio:', error);
            toast.error('Error cropping audio. Please try again.');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Time Intervals
                </h3>
                {intervals.length > 0 && (
                    <button
                        onClick={handleCropAll}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2"
                        disabled={isProcessing}
                    >
                        <Download className="w-4 h-4" />
                        Export All
                    </button>
                )}
            </div>

            {isProcessing && (
                <div className="mb-4">
                    <ProgressBar progress={progress} />
                </div>
            )}

            <div className="space-y-4">
                {intervals.map((interval) => (
                    <div
                        key={interval.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
                    >
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {interval.startTime} → {interval.endTime}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleCrop(interval)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                title="Crop and download"
                            >
                                <Scissors className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => removeInterval(interval.id)}
                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Remove interval"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {intervals.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        No intervals added yet
                    </p>
                )}
            </div>
        </div>
    );
} 