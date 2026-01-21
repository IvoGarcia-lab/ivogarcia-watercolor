'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-12 h-12 rounded-full glass flex items-center justify-center cursor-pointer overflow-hidden group"
            aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        >
            {/* Sun icon */}
            <Sun
                className={`absolute w-5 h-5 transition-all duration-500 ease-out ${theme === 'light'
                        ? 'opacity-100 rotate-0 scale-100 text-amber-500'
                        : 'opacity-0 rotate-90 scale-50 text-amber-500'
                    }`}
            />

            {/* Moon icon */}
            <Moon
                className={`absolute w-5 h-5 transition-all duration-500 ease-out ${theme === 'dark'
                        ? 'opacity-100 rotate-0 scale-100 text-blue-300'
                        : 'opacity-0 -rotate-90 scale-50 text-blue-300'
                    }`}
            />

            {/* Hover glow effect */}
            <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${theme === 'light'
                    ? 'bg-amber-500/0 group-hover:bg-amber-500/10'
                    : 'bg-blue-400/0 group-hover:bg-blue-400/10'
                }`} />
        </button>
    );
}
