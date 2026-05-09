'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const isDarkTheme = document.documentElement.classList.contains('dark');
        setIsDark(isDarkTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('vault3_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('vault3_theme', 'light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center glass clip-corners-sm hover:scale-110 transition-all duration-200 text-muted hover:text-accent relative overflow-hidden group shrink-0"
            title={isDark ? "Engage Light Mode" : "Engage Dark Mode"}
        >
            <motion.div
                initial={false}
                animate={{ 
                    y: isDark ? 0 : 40,
                    opacity: isDark ? 1 : 0
                }}
                className="absolute"
            >
                <Moon size={16} className="md:w-[18px] md:h-[18px]" />
            </motion.div>
            <motion.div
                initial={false}
                animate={{ 
                    y: isDark ? -40 : 0,
                    opacity: isDark ? 0 : 1
                }}
                className="absolute"
            >
                <Sun size={16} className="md:w-[18px] md:h-[18px]" />
            </motion.div>
            
            {/* HUD Corner Decor */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-accent opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
};
