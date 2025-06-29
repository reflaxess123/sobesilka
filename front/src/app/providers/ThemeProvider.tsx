import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsService } from '../../shared/db';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme from settings service
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedTheme = await settingsService.get<Theme>('theme', 'system');
        setThemeState(savedTheme);
      } catch (error) {
        console.warn('Failed to load theme from settings, defaulting to system:', error);
        setThemeState('system');
      }
    };

    initializeTheme();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Add listener
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, systemTheme]);

  const setTheme = async (newTheme: Theme) => {
    try {
      await settingsService.set('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme to settings:', error);
      // Still update the state even if saving fails
      setThemeState(newTheme);
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
