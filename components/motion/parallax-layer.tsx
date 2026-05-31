"use client";

import { cn } from "@/lib/utils";

type ParallaxLayerProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number;
};

/** Parallax disabled — scroll-linked transforms caused sustained layout/paint cost. */
export function ParallaxLayer({ children, className }: ParallaxLayerProps) {
  return <div className={cn(className)}>{children}</div>;
}
