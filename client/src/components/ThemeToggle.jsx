import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../features/theme/themeStore';
import { cn } from '../lib/utils';

export default function ThemeToggle({ className }) {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex h-7 w-14 items-center rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        isDark ? 'bg-gray-600' : 'bg-gray-200 border border-gray-300',
        className
      )}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md"
        animate={{ x: isDark ? 4 : 28 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={12} className="text-slate-700" />
        ) : (
          <Sun size={12} className="text-orange-500" />
        )}
      </motion.div>
    </button>
  );
}
