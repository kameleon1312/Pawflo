'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = { toggle: () => void };

const ThemeContext = createContext<ThemeContextValue>({ toggle: () => undefined });
const STORAGE_KEY = 'pawflo-theme';

/**
 * Owns the Soft UI theme for marketing pages.
 * Why no state until the user chooses: until then CSS follows prefers-color-scheme,
 * so first paint matches the system without JavaScript.
 */
export function ThemeShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') setTheme(saved);
    } catch {
      // Storage can be blocked (private mode); the system theme still applies
    }
  }, []);

  function toggle() {
    const current: Theme =
      theme ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next: Theme = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore: choice just won't persist
    }
  }

  return (
    <ThemeContext.Provider value={{ toggle }}>
      <div className="neu-root min-h-screen" data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { toggle } = useContext(ThemeContext);
  return (
    <button
      type="button"
      onClick={toggle}
      className="neu-btn w-11 h-11 text-lg"
      aria-label="Przełącz motyw jasny lub ciemny"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  );
}
