import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'indigo' | 'blue' | 'emerald' | 'rose' | 'amber';

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  effectiveMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
}

const STORAGE_KEY = 'planner_theme';

const accentMap: Record<AccentColor, { primary: string; primaryDark: string; primaryLight: string; ring: string }> = {
  indigo:  { primary: '#4f46e5', primaryDark: '#4338ca', primaryLight: '#e0e7ff', ring: 'focus:ring-indigo-500' },
  blue:    { primary: '#2563eb', primaryDark: '#1d4ed8', primaryLight: '#dbeafe', ring: 'focus:ring-blue-500' },
  emerald: { primary: '#059669', primaryDark: '#047857', primaryLight: '#d1fae5', ring: 'focus:ring-emerald-500' },
  rose:    { primary: '#e11d48', primaryDark: '#be123c', primaryLight: '#ffe4e6', ring: 'focus:ring-rose-500' },
  amber:   { primary: '#d97706', primaryDark: '#b45309', primaryLight: '#fef3c7', ring: 'focus:ring-amber-500' },
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).mode ?? 'system';
    } catch { /* ignore */ }
    return 'system';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).accent ?? 'indigo';
    } catch { /* ignore */ }
    return 'indigo';
  });

  const effectiveMode: 'light' | 'dark' = mode === 'system' ? getSystemTheme() : mode;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, accent }));
  }, [mode, accent]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Apply dark/light class
    if (effectiveMode === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }

    // Apply accent color CSS variables
    const colors = accentMap[accent];
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-dark', colors.primaryDark);
    root.style.setProperty('--color-primary-light', colors.primaryLight);

    // Update PWA theme-color meta tag
    let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = effectiveMode === 'dark' ? '#0f172a' : colors.primary;

    // Update body background for dark/light
    if (effectiveMode === 'dark') {
      body.style.background = '#0f172a';
      body.style.color = '#f1f5f9';
    } else {
      body.style.background = '#f8fafc';
      body.style.color = '#1f2937';
    }
  }, [effectiveMode, accent]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      // Force re-render by toggling state without changing stored value
      setModeState('system');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setMode = (m: ThemeMode) => setModeState(m);
  const setAccent = (a: AccentColor) => setAccentState(a);

  return (
    <ThemeContext.Provider value={{ mode, accent, effectiveMode, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
