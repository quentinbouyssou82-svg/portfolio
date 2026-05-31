"use client";

import { useCallback, useEffect, useState } from "react";

export type PreviewMode = "full" | "mobile" | "tablet";

const STORAGE_KEY = "nocta-preview-mode";

export function useResponsivePreview() {
  const [mode, setModeState] = useState<PreviewMode>("full");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as PreviewMode | null;
    if (stored === "mobile" || stored === "tablet" || stored === "full") {
      setModeState(stored);
    }
  }, []);

  const setMode = useCallback((next: PreviewMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  return { mode, setMode, mounted };
}

export function isPreviewFrame(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("preview-frame");
}

export const PREVIEW_WIDTHS: Record<Exclude<PreviewMode, "full">, number> = {
  mobile: 390,
  tablet: 834,
};
