import { Upload, Scissors, Download, ShieldCheck, Zap } from "lucide-react";

export function SiteDescription({ mode }) {
  const descriptions = {
    cropper: {
      features: [
        {
          icon: Upload,
          title: "Drag & Drop Upload",
          description: "Supports MP3, WAV, OGG, M4A, AAC files up to 200MB.",
          badge: "Browser Native",
        },
        {
          icon: Scissors,
          title: "Precision Wave Trimming",
          description: "Visual waveform selection or frame-accurate timestamp inputs.",
          badge: "Lossless Quality",
        },
        {
          icon: Download,
          title: "Batch Exporting",
          description: "Export individual clips or package all intervals into a single ZIP.",
          badge: "Instant WAV",
        },
      ],
    },
  };

  const current = descriptions[mode];

  return (
    <section className="mx-auto mt-16 max-w-5xl">
      <div className="mb-8 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">
          Built For Speed & Accuracy
        </h2>
        <p className="mt-1 text-xl font-bold tracking-tight text-primary">
          Professional Audio Trimming Features
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {current.features.map((feature, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-2xl border border-glass bg-surface/60 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-surface/90 hover:shadow-glow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20 transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-5.5 w-5.5" />
              </div>
              <span className="rounded-full bg-surface-hover px-2.5 py-0.5 text-[10px] font-semibold text-secondary border border-glass">
                {feature.badge}
              </span>
            </div>

            <h3 className="text-base font-bold text-primary transition-colors group-hover:text-amber-500">
              {feature.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
