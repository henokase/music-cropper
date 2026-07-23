import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-5xl px-5 py-28 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-light bg-surface">
        <span className="text-xl font-semibold text-muted">404</span>
      </div>
      <h1 className="mb-1.5 text-xl font-semibold text-[var(--color-text)]">
        Page not found
      </h1>
      <p className="mb-7 text-base text-secondary">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        <Home className="h-4 w-4" />
        Go Home
      </button>
    </main>
  );
}
