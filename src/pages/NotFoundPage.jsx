import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    404 - Page Not Found
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    The page you're looking for doesn't exist.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors"
                >
                    <Home className="w-5 h-5" />
                    Go Home
                </button>
            </div>
        </main>
    );
} 