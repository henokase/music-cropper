import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {this.state.error?.message || "An unexpected error occurred."}
                        </p>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.href = "/";
                            }}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
