"use client";

import { useHeavyMotionEnabled, usePrefersReducedMotion } from "@/hooks/use-motion-prefs";
import { cn } from "@/lib/utils";

type FloatMotionProps = {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
};

export function FloatMotion({ children, className }: FloatMotionProps) {
  const reduced = usePrefersReducedMotion();
  const heavy = useHeavyMotionEnabled();

  if (reduced || !heavy) {
    return <div className={cn(className)}>{children}</div>;
  }

  return <div className={cn("float-motion-idle", className)}>{children}</div>;
}
