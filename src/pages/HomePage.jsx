import { SiteDescription } from "../components/SiteDescription";
import { AudioUploader } from "../components/AudioUploader";

export function HomePage() {
    return (
        <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
                <div className="flex flex-col gap-8">
                    <h2 className="text-4xl text-center font-bold text-gray-900 dark:text-white mb-4">
                        Trim Your Audio Files with Precision
                    </h2>
                    <AudioUploader />
                    <SiteDescription mode="cropper" />
                </div>
            </div>
        </main>
    );
} 