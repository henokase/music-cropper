import { Upload, Scissors, Download } from 'lucide-react';

export function SiteDescription({ mode }) {
  const descriptions = {
    cropper: {
      text: "Upload your audio files and create perfect clips by defining custom time intervals. Perfect for podcasts, music samples, or any audio editing needs.",
      features: [
        {
          icon: Upload,
          title: "Easy Upload",
          description: "Support for MP3, WAV, OGG, and AAC formats up to 200MB"
        },
        {
          icon: Scissors,
          title: "Define Intervals",
          description: "Set precise start and end times for your clips"
        },
        {
          icon: Download,
          title: "Download Clips",
          description: "Get your cropped audio files instantly"
        }
      ]
    }
  };

  const currentDescription = descriptions[mode];

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="text-center mb-12">
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {currentDescription.text}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {currentDescription.features.map((feature, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <feature.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 