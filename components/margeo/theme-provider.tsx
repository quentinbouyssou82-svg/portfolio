"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type UberlyTheme = "dark" | "light";

const STORAGE_KEY = "uberly-theme";

type ThemeContextValue = {
  theme: UberlyTheme;
  setTheme: (theme: UberlyTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: UberlyTheme) {
  const root = document.querySelector(".uberly-root");
  if (root instanceof HTMLElement) {
    root.dataset.theme = theme;
  }
  document.documentElement.style.colorScheme = theme;
}

export function UberlyThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<UberlyTheme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as UberlyTheme | null;
      const initial =
        stored === "light" || stored === "dark" ? stored : "dark";
      setThemeState(initial);
      applyTheme(initial);
    } catch {
      applyTheme("dark");
    }
  }, []);

  const setTheme = useCallback((next: UberlyTheme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useUberlyTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark" as UberlyTheme,
      setTheme: (_: UberlyTheme) => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
