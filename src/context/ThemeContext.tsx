import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'dual' | 'light';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
});

const themeVars: Record<Theme, Record<string, string>> = {
  dark: {
    '--bg': '#070913',
    '--surface': 'rgba(13,17,39,0.60)',
    '--border': 'rgba(255,255,255,0.06)',
    '--text': '#f1f3f9',
    '--muted': '#8fa0dd',
    '--sidebar-bg': '#04060d',
    '--topbar-bg': 'rgba(7,9,19,0.8)',
    '--card-bg': 'rgba(13,17,39,0.60)',
    '--card-text': '#f1f3f9',
  },
  dual: {
    '--bg': '#f0f0f8',
    '--surface': 'rgba(255,255,255,0.9)',
    '--border': 'rgba(0,0,0,0.08)',
    '--text': '#1a1a2e',
    '--muted': '#5a6a9a',
    '--sidebar-bg': '#04060d',
    '--topbar-bg': 'rgba(255,255,255,0.9)',
    '--card-bg': 'rgba(255,255,255,0.9)',
    '--card-text': '#1a1a2e',
  },
  light: {
    '--bg': '#f0f0f8',
    '--surface': 'rgba(255,255,255,1)',
    '--border': 'rgba(0,0,0,0.08)',
    '--text': '#1a1a2e',
    '--muted': '#5a6a9a',
    '--sidebar-bg': '#f8f8ff',
    '--topbar-bg': 'rgba(255,255,255,0.95)',
    '--card-bg': 'rgba(255,255,255,1)',
    '--card-text': '#1a1a2e',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

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
