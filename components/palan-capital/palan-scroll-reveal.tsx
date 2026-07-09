"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

type PalanScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function PalanScrollReveal({ children, className, delay = 0 }: PalanScrollRevealProps) {
  return (
    <ScrollReveal className={cn(className)} delay={delay}>
      {children}
    </ScrollReveal>
  );
}
