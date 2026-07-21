"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UBERLY_BASE } from "@/lib/margeo/routes";

export type UberlyTheme = "dark" | "light";

const STORAGE_KEY = "uberly-theme";

type ThemeContextValue = {
  theme: UberlyTheme;
  setTheme: (theme: UberlyTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Landing / login / signup / forgot — toujours sombre. */
export function isUberlyMarketingPath(pathname: string | null): boolean {
  if (!pathname) return true;
  const base = UBERLY_BASE.replace(/\/$/, "");
  if (pathname === base || pathname === `${base}/`) return true;
  if (pathname.startsWith(`${base}/login`)) return true;
  if (pathname.startsWith(`${base}/signup`)) return true;
  if (pathname.startsWith(`${base}/forgot-password`)) return true;
  return false;
}

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
  const pathname = usePathname();
  const forceDark = isUberlyMarketingPath(pathname);
  const [storedTheme, setStoredTheme] = useState<UberlyTheme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as UberlyTheme | null;
      const initial =
        stored === "light" || stored === "dark" ? stored : "dark";
      setStoredTheme(initial);
    } catch {
      setStoredTheme("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(forceDark ? "dark" : storedTheme);
  }, [forceDark, storedTheme]);

  const setTheme = useCallback(
    (next: UberlyTheme) => {
      setStoredTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      if (!forceDark) applyTheme(next);
    },
    [forceDark],
  );

  const toggleTheme = useCallback(() => {
    setTheme(storedTheme === "dark" ? "light" : "dark");
  }, [setTheme, storedTheme]);

  const value = useMemo(
    () => ({
      theme: forceDark ? ("dark" as const) : storedTheme,
      setTheme,
      toggleTheme,
    }),
    [forceDark, storedTheme, setTheme, toggleTheme],
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
