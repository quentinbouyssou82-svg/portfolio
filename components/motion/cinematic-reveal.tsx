"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import type { ElementType, ReactNode } from "react";

type CinematicRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
};

/** Scroll-triggered reveal (IntersectionObserver + CSS). */
export function CinematicReveal({
  children,
  className,
  delay = 0,
  as = "div",
}: CinematicRevealProps) {
  return (
    <ScrollReveal
      as={as as ElementType}
      className={className}
      delay={delay}
    >
      {children}
    </ScrollReveal>
  );
}
