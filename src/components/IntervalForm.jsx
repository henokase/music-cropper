import { useState } from 'react';
import { useAudioStore } from '../store/useAudioStore';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export function IntervalForm() {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const audioFile = useAudioStore((state) => state.audioFile);
    const addInterval = useAudioStore((state) => state.addInterval);

    const validateTimeFormat = (time) => {
        const pattern = /^([0-9]+):([0-5][0-9])$/;
        return pattern.test(time);
    };

    const convertToSeconds = (time) => {
        const [minutes, seconds] = time.split(':').map(Number);
        return minutes * 60 + seconds;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
            toast.error('Please enter valid time format (mm:ss)');
            return;
        }

        const startSeconds = convertToSeconds(startTime);
        const endSeconds = convertToSeconds(endTime);
        const duration = audioFile?.duration || 0;

        if (startSeconds >= endSeconds) {
            toast.error('End time must be after start time');
            return;
        }

        if (endSeconds > duration) {
            toast.error('Time interval exceeds audio duration');
            return;
        }

        addInterval({ startTime, endTime });
        setStartTime('');
        setEndTime('');
        toast.success('Interval added successfully');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Add Time Interval
            </h3>
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[120px]">
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Time (mm:ss)
                    </label>
                    <input
                        type="text"
                        id="startTime"
                        placeholder="00:00"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Time (mm:ss)
                    </label>
                    <input
                        type="text"
                        id="endTime"
                        placeholder="00:00"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Interval
                    </button>
                </div>
            </div>
        </form>
    );
} 