// src/hooks/useTheme.js
import { useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'theme';

function systemPrefersDark() {
    return typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') return saved;
        return systemPrefersDark() ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem(THEME_KEY, theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggle = useCallback(() => {
        setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    }, []);

    return { theme, setTheme, toggle };
}
