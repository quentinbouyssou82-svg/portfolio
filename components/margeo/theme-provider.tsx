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
import { DRIVEELY_BASE } from "@/lib/margeo/routes";

export type DriveelyTheme = "dark" | "light";

const STORAGE_KEY = "driveely-theme";
const LEGACY_STORAGE_KEY = "uberly-theme";

type ThemeContextValue = {
  theme: DriveelyTheme;
  setTheme: (theme: DriveelyTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Landing / login / signup / forgot — toujours sombre. */
export function isDriveelyMarketingPath(pathname: string | null): boolean {
  if (!pathname) return true;
  const base = DRIVEELY_BASE.replace(/\/$/, "");
  if (pathname === base || pathname === `${base}/`) return true;
  if (pathname.startsWith(`${base}/login`)) return true;
  if (pathname.startsWith(`${base}/signup`)) return true;
  if (pathname.startsWith(`${base}/forgot-password`)) return true;
  return false;
}

function applyTheme(theme: DriveelyTheme) {
  const root = document.querySelector(".driveely-root");
  if (root instanceof HTMLElement) {
    root.dataset.theme = theme;
  }
  document.documentElement.style.colorScheme = theme;
}

export function DriveelyThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const forceDark = isDriveelyMarketingPath(pathname);
  const [storedTheme, setStoredTheme] = useState<DriveelyTheme>("dark");

  useEffect(() => {
    try {
      const stored =
        (localStorage.getItem(STORAGE_KEY) as DriveelyTheme | null) ||
        (localStorage.getItem(LEGACY_STORAGE_KEY) as DriveelyTheme | null);
      const initial =
        stored === "light" || stored === "dark" ? stored : "dark";
      setStoredTheme(initial);
      if (!localStorage.getItem(STORAGE_KEY) && stored) {
        localStorage.setItem(STORAGE_KEY, stored);
      }
    } catch {
      setStoredTheme("dark");
    }
  }, []);

  useEffect(() => {
    applyTheme(forceDark ? "dark" : storedTheme);
  }, [forceDark, storedTheme]);

  const setTheme = useCallback(
    (next: DriveelyTheme) => {
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

export function useDriveelyTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark" as DriveelyTheme,
      setTheme: (_: DriveelyTheme) => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
