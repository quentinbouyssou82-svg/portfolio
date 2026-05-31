"use client";

import { useHeavyMotionEnabled } from "@/hooks/use-motion-prefs";
import { cn } from "@/lib/utils";

/** Static blurred orbs — avoids infinite Framer + blur-3xl repaint loops. */
export function FloatBlobs({ className }: { className?: string }) {
  const heavy = useHeavyMotionEnabled();

  if (!heavy) return null;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        aria-hidden
        className="float-blob float-blob-a absolute -left-24 top-1/4 size-72 rounded-full bg-[var(--glow-soft)] blur-3xl"
      />
      <div
        aria-hidden
        className="float-blob float-blob-b absolute -right-16 top-1/3 size-96 rounded-full bg-[var(--glow)]/30 blur-3xl"
      />
      <div
        aria-hidden
        className="float-blob float-blob-c absolute bottom-0 left-1/3 size-64 rounded-full bg-[var(--ring)]/10 blur-3xl"
      />
    </div>
  );
}
