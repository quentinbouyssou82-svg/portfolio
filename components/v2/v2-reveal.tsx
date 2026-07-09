"use client";

import type { ElementType, ReactNode } from "react";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { V2_MOTION } from "@/lib/v2-motion";

type V2RevealProps = {
  children: ReactNode;
  className?: string;
  /** step1–step6 from V2_MOTION.delay */
  step?: keyof typeof V2_MOTION.delay;
  as?: ElementType;
  threshold?: number;
};

/** Reveal standardisé V2 — délais et easing unifiés. */
export function V2Reveal({
  children,
  className,
  step = "step1",
  as = "div",
  threshold,
}: V2RevealProps) {
  return (
    <ScrollReveal
      as={as}
      className={className}
      delay={V2_MOTION.delay[step]}
      threshold={threshold}
    >
      {children}
    </ScrollReveal>
  );
}
