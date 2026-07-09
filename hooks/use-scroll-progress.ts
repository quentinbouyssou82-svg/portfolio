"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion-prefs";

type ScrollProgressOptions = {
  /** Viewport ratio where progress begins (0 = top, 1 = bottom). */
  start?: number;
  /** Viewport ratio where progress completes. */
  end?: number;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Scroll-driven progress (0–1) for an element. rAF-throttled, passive listeners.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  { start = 0.82, end = 0.28 }: ScrollProgressOptions = {},
) {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      setProgress(1);
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const startY = vh * start;
      const endY = vh * end;
      const span = rect.height + startY - endY;
      const raw = span <= 0 ? 1 : (startY - rect.top) / span;
      setProgress(clamp(raw));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, reduced, start, end]);

  return progress;
}

export function stepProgress(overall: number, index: number, total: number) {
  if (total <= 0) return 1;
  const segment = 1 / total;
  const pad = segment * 0.12;
  const start = index * segment;
  const local = (overall - start + pad) / (segment + pad * 0.5);
  return clamp(local);
}

export function lineProgress(step: number, lineIndex: number, lineCount: number) {
  if (lineCount <= 0) return 1;
  const slot = 1 / lineCount;
  const offset = lineIndex * slot * 0.55;
  return clamp((step - offset) / (slot * 0.85));
}

export function emphasisProgress(step: number, delay = 0.35) {
  return clamp((step - delay) / 0.45);
}
