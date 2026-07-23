import { useNavigate } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-5xl px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-glass bg-surface/80 shadow-card-glass backdrop-blur-xl">
        <AlertCircle className="h-10 w-10 text-amber-500" />
      </div>
      <h1 className="mb-2 text-3xl font-extrabold text-primary">
        Page Not Found
      </h1>
      <p className="mb-8 text-sm text-secondary max-w-md mx-auto">
        The requested page or audio workspace path could not be located.
      </p>
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:from-amber-600 hover:to-amber-700 hover:shadow-glow-sm"
      >
        <Home className="h-4 w-4" />
        Return to Home Studio
      </button>
    </main>
  );
}
