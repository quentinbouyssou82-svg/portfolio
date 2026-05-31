"use client";

import { ScrollRevealGroup } from "@/components/motion/scroll-reveal-group";
import type { ReactNode } from "react";

type GsapStaggerProps = {
  children: ReactNode;
  className?: string;
  itemSelector?: string;
};

/** Staggered scroll reveal (CSS + IntersectionObserver, no GSAP). */
export function GsapStagger({
  children,
  className,
  itemSelector = "[data-stagger-item]",
}: GsapStaggerProps) {
  return (
    <ScrollRevealGroup className={className} itemSelector={itemSelector}>
      {children}
    </ScrollRevealGroup>
  );
}
