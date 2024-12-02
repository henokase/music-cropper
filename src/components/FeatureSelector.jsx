import { Scissors } from 'lucide-react';

export function FeatureSelector({ selectedFeature, onFeatureSelect }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onFeatureSelect('cropper')}
          className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 shadow-xl hover:scale-[1.009] duration-200 ${
            selectedFeature === 'cropper'
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:transform-none'
              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-400'
          }`}
        >
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
            <Scissors className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Audio Cropper
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trim and crop your audio files with precision
            </p>
          </div>
        </button>
      </div>
    </div>
  );
} 