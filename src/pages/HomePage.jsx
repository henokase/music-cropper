import { SiteDescription } from "../components/SiteDescription";
import { AudioUploader } from "../components/AudioUploader";

export function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <div className="mb-14 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-text)]">
          Trim Your Audio Files with Precision
        </h1>
        <p className="mt-2.5 text-base text-secondary">
          Upload, crop, and export audio clips in seconds
        </p>
      </div>
      <AudioUploader />
      <SiteDescription mode="cropper" />
    </main>
  );
}
