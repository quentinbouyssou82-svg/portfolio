"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { useThrottledScroll } from "@/hooks/use-throttled-scroll";
import { usePrefersReducedMotion } from "@/hooks/use-motion-prefs";
import { cn } from "@/lib/utils";

type SubtleParallaxProps = {
  children: ReactNode;
  className?: string;
  maxOffset?: number;
};

export function SubtleParallax({
  children,
  className,
  maxOffset = 8,
}: SubtleParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const viewport = window.innerHeight;
    const center = rect.top + rect.height * 0.5;
    const progress = 1 - center / (viewport + rect.height * 0.5);
    const clamped = Math.max(0, Math.min(1, progress));
    const y = (clamped - 0.5) * 2 * maxOffset;

    el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
  }, [maxOffset]);

  useThrottledScroll(update, !reduced);

  return (
    <div
      ref={ref}
      className={cn("subtle-parallax-layer", className)}
      style={reduced ? undefined : undefined}
    >
      {children}
    </div>
  );
}
