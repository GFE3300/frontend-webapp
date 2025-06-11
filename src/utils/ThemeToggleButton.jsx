import { useTheme, ThemeProvider } from "./ThemeProvider";
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggleButton = () => { // Exported if it's in this file, otherwise import
    const { theme, toggleTheme } = useTheme();
    if (!theme) return null;

    return (
        <motion.button
            onClick={toggleTheme}
            className="fixed top-20 right-20 z-500 p-2 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === 'light' ? (
                    <motion.div key="sun" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun className="w-5 h-5 text-yellow-600" />
                    </motion.div>
                ) : (
                    <motion.div key="moon" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon className="w-5 h-5 text-indigo-400" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
};

export function ThemeToggle() {
    return (
        <ThemeProvider>
            <ThemeToggleButton />
        </ThemeProvider>
    );
}