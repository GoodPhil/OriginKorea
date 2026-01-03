'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  theme: ResolvedTheme; // The actual applied theme
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: ResolvedTheme, enableTransition = true) {
  const root = document.documentElement;

  // Enable smooth transition
  if (enableTransition) {
    root.style.setProperty('--theme-transition', 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease');
    document.body.style.transition = 'background-color 0.3s ease';
  }

  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }

  // Remove transition after it completes to avoid affecting other animations
  if (enableTransition) {
    setTimeout(() => {
      root.style.removeProperty('--theme-transition');
      document.body.style.transition = '';
    }, 350);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [theme, setTheme] = useState<ResolvedTheme>('dark');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Resolve theme based on mode
  const resolveTheme = useCallback((currentMode: ThemeMode): ResolvedTheme => {
    if (currentMode === 'system') {
      return getSystemTheme();
    }
    return currentMode;
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('themeMode') as ThemeMode;
    const initialMode = saved && ['dark', 'light', 'system'].includes(saved) ? saved : 'dark';
    const resolvedTheme = resolveTheme(initialMode);

    setModeState(initialMode);
    setTheme(resolvedTheme);
    applyTheme(resolvedTheme, false);
    setMounted(true);
  }, [resolveTheme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (!mounted || mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted, mode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setIsTransitioning(true);
    setModeState(newMode);
    localStorage.setItem('themeMode', newMode);

    const resolvedTheme = resolveTheme(newMode);
    setTheme(resolvedTheme);
    applyTheme(resolvedTheme);

    setTimeout(() => setIsTransitioning(false), 350);
  }, [resolveTheme]);

  const toggleTheme = useCallback(() => {
    // Cycle through: dark -> light -> system -> dark
    const nextMode: ThemeMode = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark';
    setMode(nextMode);
  }, [mode, setMode]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ mode: 'dark', theme: 'dark', setMode: () => {}, toggleTheme: () => {}, isTransitioning: false }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
