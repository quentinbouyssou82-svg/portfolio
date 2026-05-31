"use client";

import { useRef, useState } from "react";
import { useMotionEnabled } from "@/hooks/use-motion-prefs";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
};

export function TiltCard({ children, className, maxTilt = 5 }: TiltCardProps) {
  const clipRef = useRef<HTMLDivElement>(null);
  const motionEnabled = useMotionEnabled();
  const [transform, setTransform] = useState("");
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!motionEnabled || !clipRef.current) return;
    const rect = clipRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;
    const rotateX = -py * maxTilt;
    const rotateY = px * maxTilt;

    setTransform(
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`,
    );
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
  }

  function onLeave() {
    setTransform("");
    setGlow({ x: 50, y: 50, opacity: 0 });
  }

  if (!motionEnabled) {
    return <div className={cn("h-full", className)}>{children}</div>;
  }

  return (
    <div
      ref={clipRef}
      className={cn("tilt-card-clip relative h-full overflow-hidden rounded-3xl", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        aria-hidden
        className="tilt-card-glow pointer-events-none absolute inset-0 z-[1] rounded-3xl transition-opacity duration-300"
        style={{
          opacity: glow.opacity,
          background: `radial-gradient(320px circle at ${glow.x}% ${glow.y}%, color-mix(in srgb, var(--accent) 32%, transparent), transparent 72%)`,
        }}
      />
      <div
        className="tilt-card-wrap relative z-[2] h-full rounded-3xl"
        style={{
          transform: transform || undefined,
          transition:
            "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 400ms ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
