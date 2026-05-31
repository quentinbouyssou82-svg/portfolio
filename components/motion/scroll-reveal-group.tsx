"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion-prefs";
import { cn } from "@/lib/utils";

type ScrollRevealGroupProps = {
  children: ReactNode;
  className?: string;
  itemSelector?: string;
  threshold?: number;
};

export function ScrollRevealGroup({
  children,
  className,
  itemSelector = "[data-stagger-item]",
  threshold = 0.1,
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = root.querySelectorAll(itemSelector);
    items.forEach((item, index) => {
      (item as HTMLElement).classList.add("reveal-stagger-item");
      (item as HTMLElement).style.setProperty("--stagger-index", String(index));
    });

    if (reduced) {
      root.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          root.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -4% 0px" },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [reduced, itemSelector, threshold]);

  return (
    <div ref={ref} className={cn("reveal-stagger", className)}>
      {children}
    </div>
  );
}
