import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'dual' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => { },
});

const themeVars: Record<Theme, Record<string, string>> = {
  dark: {
    '--bg': '#070913',
    '--surface': 'rgba(13,17,39,0.60)',
    '--border': 'rgba(255,255,255,0.06)',
    '--cyan': '#00f0ff',
    '--purple': '#7000ff',
    '--orange': '#ff9900',
    '--text': '#f1f3f9',
    '--muted': '#8fa0dd',
    '--sidebar-bg': '#04060d',
    '--topbar-bg': 'rgba(7,9,19,0.8)',
    '--card-bg': 'rgba(13,17,39,0.60)',
    '--card-text': '#f1f3f9',
    '--transition': 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
  },
  dual: {
    '--bg': '#f0f0f8',
    '--surface': 'rgba(255,255,255,0.9)',
    '--border': 'rgba(0,0,0,0.08)',
    '--cyan': '#0066cc',
    '--purple': '#6c47ff',
    '--orange': '#f07800',
    '--text': '#1a1a2e',
    '--muted': '#5a6a9a',
    '--sidebar-bg': '#04060d',
    '--topbar-bg': 'rgba(255,255,255,0.9)',
    '--card-bg': 'rgba(255,255,255,0.9)',
    '--card-text': '#1a1a2e',
    '--transition': 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
  },
  light: {
    '--bg': '#faf5ff',
    '--surface': 'rgba(255,255,255,1)',
    '--border': 'rgba(111,43,139,0.15)',
    '--cyan': '#B56DD3',
    '--purple': '#7030B1',
    '--orange': '#f07800',
    '--text': '#1f2937',
    '--muted': '#6b7280',
    '--sidebar-bg': '#ffffff',
    '--topbar-bg': 'rgba(255,255,255,0.95)',
    '--card-bg': 'rgba(255,255,255,1)',
    '--card-text': '#1f2937',
    '--transition': 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
  },
};

// Apply light theme immediately to prevent flash of dark content
(function applyInitialTheme() {
  const vars = themeVars['light'];
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.setAttribute('data-theme', 'light');
})();

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const vars = themeVars[theme];
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
