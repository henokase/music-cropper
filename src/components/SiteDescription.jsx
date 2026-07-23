import { Upload, Scissors, Download } from "lucide-react";

export function SiteDescription({ mode }) {
  const descriptions = {
    cropper: {
      features: [
        {
          icon: Upload,
          title: "Upload",
          description: "MP3, WAV, OGG, AAC up to 200MB",
        },
        {
          icon: Scissors,
          title: "Crop",
          description: "Set precise start and end times",
        },
        {
          icon: Download,
          title: "Export",
          description: "Download as WAV or ZIP batch",
        },
      ],
    },
  };

  const current = descriptions[mode];

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-4">
      {current.features.map((feature, index) => (
        <div
          key={index}
          className="rounded-lg border border-light bg-surface p-5 text-center transition-colors hover:bg-surface-hover"
        >
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary-subtle)]">
            <feature.icon className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <h3 className="text-base font-medium text-[var(--color-text)]">
            {feature.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
