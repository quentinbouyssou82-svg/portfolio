"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { initApexScrollStory } from "@/lib/apex-advisory/scroll-story";
import { usePrefersReducedMotion } from "@/hooks/use-motion-prefs";
import { useApexLocale } from "./apex-locale-provider";

export function ApexScrollStory({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { locale } = useApexLocale();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    return initApexScrollStory(root, reduced);
  }, [locale, reduced]);

  return (
    <main ref={ref} className="ax-main">
      {children}
    </main>
  );
}
