"use client";

import { createContext, useContext, useMemo } from "react";

type ScrollApi = {
  scrollTo: (target: string, offset?: number) => void;
};

const PalanScrollContext = createContext<ScrollApi | null>(null);

export function usePalanScroll() {
  return useContext(PalanScrollContext);
}

function nativeScrollTo(target: string, offset = -88) {
  const el = document.querySelector(target);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: "smooth" });
}

export function PalanMotionProvider({ children }: { children: React.ReactNode }) {
  const api = useMemo<ScrollApi>(() => ({ scrollTo: nativeScrollTo }), []);
  return <PalanScrollContext.Provider value={api}>{children}</PalanScrollContext.Provider>;
}
