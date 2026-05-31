"use client";

import { useEffect } from "react";

/** Passive scroll listener, max one rAF callback per frame. */
export function useThrottledScroll(onScroll: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onScroll, enabled]);
}
