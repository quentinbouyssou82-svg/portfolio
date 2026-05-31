"use client";

import { useRef, type ComponentProps } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion-prefs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MagneticButtonProps = ComponentProps<typeof Button> & {
  strength?: number;
};

export function MagneticButton({
  className,
  strength = 0.18,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = usePrefersReducedMotion();

  function handleMove(event: React.MouseEvent<HTMLButtonElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * strength;
    const y = (event.clientY - rect.top - rect.height / 2) * strength;
    ref.current.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
  }

  function reset() {
    if (!ref.current) return;
    ref.current.style.transform = "";
  }

  return (
    <Button
      ref={ref}
      className={cn("magnetic-btn", className)}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onBlur={reset}
      {...props}
    >
      {children}
    </Button>
  );
}
