"use client";

import { createContext, useContext, useMemo } from "react";

type ScrollApi = {
  scrollTo: (target: string, offset?: number) => void;
};

const ApexScrollContext = createContext<ScrollApi | null>(null);

export function useApexScroll() {
  return useContext(ApexScrollContext);
}

function nativeScrollTo(target: string, offset = -88) {
  const el = document.querySelector(target);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: "smooth" });
}

export function ApexMotionProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo<ScrollApi>(
    () => ({ scrollTo: nativeScrollTo }),
    [],
  );

  return <ApexScrollContext.Provider value={api}>{children}</ApexScrollContext.Provider>;
}
