"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardHoverGlowProps = {
  children: ReactNode;
  className?: string;
};

export function CardHoverGlow({ children, className }: CardHoverGlowProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glow-x", `${x}%`);
    el.style.setProperty("--glow-y", `${y}%`);
  }

  function handleLeave() {
    ref.current?.style.setProperty("--glow-x", "50%");
    ref.current?.style.setProperty("--glow-y", "40%");
  }

  return (
    <div
      ref={ref}
      className={cn("card-hover-glow", className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
