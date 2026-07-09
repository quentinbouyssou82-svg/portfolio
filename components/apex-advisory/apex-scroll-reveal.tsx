"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

type ApexScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/** Lightweight scroll reveal — CSS + IntersectionObserver (Safari-safe). */
export function ApexScrollReveal({ children, className, delay = 0 }: ApexScrollRevealProps) {
  return (
    <ScrollReveal className={cn(className)} delay={delay}>
      {children}
    </ScrollReveal>
  );
}
