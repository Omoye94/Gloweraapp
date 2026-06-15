import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, gradients, darkGradients, ThemeColors } from '../theme/colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  gradients: typeof gradients;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'glowera-theme-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        setThemeModeState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  // Dark mode is forced OFF for launch — only ~8 of 40+ screens currently honor
  // the theme tokens, so allowing dark mode produces an inconsistent UI where
  // some screens go dark and most stay light. The infrastructure stays wired so
  // this single override can be removed once every screen is dark-mode-aware.
  // The appearance picker in Profile has been hidden in lockstep with this.
  const _wouldBeDark =
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const isDark = false;
  void _wouldBeDark; // keep var around for the eventual unforced behavior

  // Get the active theme
  const activeTheme = isDark ? darkTheme : lightTheme;
  const activeGradients = isDark ? darkGradients : gradients;

  // Save theme preference
  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // Don't render until theme preference is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: activeTheme,
        themeMode,
        isDark,
        gradients: activeGradients,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export a hook that returns just the theme colors for compatibility
export function useThemeColors(): ThemeColors {
  const context = useContext(ThemeContext);
  // If no context (outside provider), return light theme as fallback
  return context?.theme ?? lightTheme;
}
