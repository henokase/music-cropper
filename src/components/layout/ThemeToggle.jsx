import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") || "light";
        }
        return "light";
    });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <motion.button
            className="relative w-16 h-8 bg-gray-300 rounded-full p-1 flex items-center dark:bg-gray-700 transition-colors duration-300"
            onClick={toggleTheme}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            animate={{ scale: isHovered ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
        >
            <motion.div
                className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                animate={{
                    x: theme === 'dark' ? 32 : 0,
                    rotate: theme === 'dark' ? 360 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <motion.div
                    animate={{
                        scale: isHovered ? 1.2 : 1,
                        rotate: isHovered ? 360 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    {theme === 'light' ? (
                        <Sun className="w-4 h-4 text-yellow-500" />
                    ) : (
                        <Moon className="w-4 h-4 text-blue-300" />
                    )}
                </motion.div>
            </motion.div>
            <motion.div
                className="absolute inset-0 flex items-center justify-around"
                animate={{ opacity: isHovered ? 1 : 0 }}
            >
                <Sun className="w-4 h-4 text-yellow-500" />
                <Moon className="w-4 h-4 text-blue-300" />
            </motion.div>
        </motion.button>
    );
}
