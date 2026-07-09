"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  APEX_DEFAULT_LOCALE,
  APEX_LOCALE_STORAGE_KEY,
  apexMessages,
  type ApexLocale,
  type ApexMessages,
} from "@/lib/apex-advisory/i18n";

type ApexLocaleContextValue = {
  locale: ApexLocale;
  ready: boolean;
  setLocale: (locale: ApexLocale) => void;
  t: ApexMessages;
};

const ApexLocaleContext = createContext<ApexLocaleContextValue | null>(null);

export function useApexLocale() {
  const ctx = useContext(ApexLocaleContext);
  if (!ctx) {
    throw new Error("useApexLocale must be used within ApexLocaleProvider");
  }
  return ctx;
}

export function ApexLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<ApexLocale>(APEX_DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(APEX_LOCALE_STORAGE_KEY);
      if (stored === "fr" || stored === "en") {
        setLocaleState(stored);
      }
    } catch {
      /* private browsing */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    try {
      localStorage.setItem(APEX_LOCALE_STORAGE_KEY, locale);
    } catch {
      /* private browsing */
    }
    document.title = apexMessages[locale].meta.title;
  }, [locale, ready]);

  const setLocale = useCallback((next: ApexLocale) => {
    setLocaleState(next);
  }, []);

  const value = useMemo<ApexLocaleContextValue>(
    () => ({
      locale,
      ready,
      setLocale,
      t: apexMessages[locale],
    }),
    [locale, ready, setLocale],
  );

  return <ApexLocaleContext.Provider value={value}>{children}</ApexLocaleContext.Provider>;
}
