import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
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
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-glass bg-surface/60 text-[#2C8179] shadow-sm transition-all duration-200 hover:border-[#2C8179]/50 hover:bg-surface-hover hover:shadow-glow-sm"
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}

    >
      <span className={spinning ? "animate-[spin_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]" : "transition-transform duration-200 hover:scale-110"}>
        {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-[#2C8179]" />}
      </span>
    </button>
  );
}
