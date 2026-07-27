import { SiteDescription } from "../components/SiteDescription";
import { AudioUploader } from "../components/AudioUploader";

export function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      {/* Hero Section */}
      <div className="mb-14 text-center">

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary max-w-3xl mx-auto leading-[1.15]">
          Crop & Trim Your Audio Files with{" "}
          <span className="text-[#2C8179] bg-clip-text">
            Studio Precision
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-secondary max-w-xl mx-auto leading-relaxed">
          Upload any song or audio clip, visualize waveforms instantly, drag to slice intervals, and export high quality WAV audio directly in your browser.
        </p>
      </div>

      {/* Upload Zone */}
      <AudioUploader />

      {/* Feature Breakdown */}
      <SiteDescription mode="cropper" />
    </main>
  );
}
