import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [spinning, setSpinning] = useState(false);

  const toggleTheme = () => {
    setSpinning(true);
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      onAnimationEnd={() => setSpinning(false)}
      className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-light text-amber-600 transition-colors hover:bg-surface-hover dark:text-amber-500"
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
    >
      <span className={spinning ? "animate-[spin_0.4s_ease-out]" : ""}>
        {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </span>
    </button>
  );
}
