import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Music } from 'lucide-react';
import { useAudioStore } from '../../store/useAudioStore';
import { useEffect } from 'react';

export function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const clearAudio = useAudioStore((state) => state.clearAudio);
    const audioFile = useAudioStore((state) => state.audioFile);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (location.pathname === '/editor' && audioFile) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        const handlePopState = (e) => {
            if (location.pathname === '/editor' && audioFile) {
                e.preventDefault();
                const confirmed = window.confirm('Are you sure you want to leave? All progress will be lost.');
                if (confirmed) {
                    clearAudio();
                    navigate('/', { replace: true });
                } else {
                    window.history.pushState(null, '', '/editor');
                }
            }
        };

        if (location.pathname === '/editor' && audioFile) {
            window.history.pushState(null, '', '/editor');
        }

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location.pathname, audioFile, clearAudio, navigate]);

    const handleNavigation = () => {
        if (location.pathname === '/editor' && audioFile) {
            if (window.confirm('Are you sure you want to leave? All progress will be lost.')) {
                clearAudio();
                navigate('/', { replace: true });
            }
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <button
                                onClick={handleNavigation}
                                className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                <Music className="w-6 h-6" />
                                <span className="text-lg font-semibold">MusicCropper</span>
                            </button>
                        </div>
                        <div className="flex items-center">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>
            {children}
        </div>
    );
}