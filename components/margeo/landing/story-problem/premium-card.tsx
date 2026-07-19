"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/margeo/utils";

const SPRING = { stiffness: 260, damping: 28 };

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
  tilt?: boolean;
}

export function PremiumCard({
  children,
  className,
  index = 0,
  tilt = true,
}: PremiumCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [3.5, -3.5]), SPRING);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4.5, 4.5]), SPRING);
  const glowX = useTransform(mx, [-0.5, 0.5], ["20%", "80%"]);
  const glowBg = useTransform(
    glowX,
    (x) =>
      `radial-gradient(600px circle at ${x} 0%, rgba(255,255,255,0.07), transparent 42%)`,
  );

  const onMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion || !tilt || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mx.set((event.clientX - rect.left) / rect.width - 0.5);
      my.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [mx, my, reduceMotion, tilt],
  );

  const reset = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 22, filter: "blur(10px)", scale: 0.97 }
      }
      whileInView={
        reduceMotion
          ? undefined
          : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }
      }
      whileHover={
        reduceMotion || !tilt ? undefined : { scale: 1.008, y: -2 }
      }
      viewport={{ once: true, margin: "-48px" }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 30,
        delay: index * 0.07,
      }}
      style={
        reduceMotion || !tilt
          ? undefined
          : { rotateX, rotateY, transformPerspective: 1000 }
      }
      className={cn("problem-premium-card group", className)}
    >
      <motion.div
        className="problem-premium-card-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={reduceMotion ? undefined : { background: glowBg }}
        aria-hidden
      />
      <div className="problem-premium-card-shine" aria-hidden />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}

type BadgeTone = "neutral" | "warn" | "danger" | "accent" | "go";

const BADGE_TONE: Record<
  BadgeTone,
  { ring: string; bg: string; icon: string; glow: string }
> = {
  neutral: {
    ring: "border-white/[0.12]",
    bg: "bg-gradient-to-br from-white/[0.08] to-white/[0.02]",
    icon: "text-mg-muted",
    glow: "shadow-[0_0_20px_rgba(255,255,255,0.04)]",
  },
  warn: {
    ring: "border-mg-check/35",
    bg: "bg-gradient-to-br from-mg-check-soft to-transparent",
    icon: "text-mg-check",
    glow: "shadow-[0_0_22px_rgba(251,191,36,0.12)]",
  },
  danger: {
    ring: "border-mg-stop/35",
    bg: "bg-gradient-to-br from-mg-stop-soft to-transparent",
    icon: "text-mg-stop",
    glow: "shadow-[0_0_22px_rgba(248,113,113,0.14)]",
  },
  accent: {
    ring: "border-mg-accent/35",
    bg: "bg-gradient-to-br from-mg-accent-soft to-transparent",
    icon: "text-mg-accent",
    glow: "shadow-[0_0_22px_rgba(129,140,248,0.14)]",
  },
  go: {
    ring: "border-mg-go/35",
    bg: "bg-gradient-to-br from-mg-go-soft to-transparent",
    icon: "text-mg-go",
    glow: "shadow-[0_0_22px_rgba(52,211,153,0.14)]",
  },
};

export function PremiumIconBadge({
  icon: Icon,
  tone = "neutral",
  size = "md",
  className,
  idle = true,
}: {
  icon: LucideIcon;
  tone?: BadgeTone;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Idle bob — désactiver sur les rails/timeline pour garder les connecteurs alignés. */
  idle?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const styles = BADGE_TONE[tone];
  const dim =
    size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-10";
  const iconDim =
    size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4";

  return (
    <motion.span
      animate={reduceMotion || !idle ? undefined : { y: [0, -2, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-xl border backdrop-blur-sm",
        dim,
        styles.ring,
        styles.bg,
        styles.glow,
        className,
      )}
    >
      <Icon className={cn(iconDim, styles.icon)} aria-hidden />
    </motion.span>
  );
}

export function mapStepTone(
  tone?: "neutral" | "warn" | "danger",
): BadgeTone {
  if (tone === "danger") return "danger";
  if (tone === "warn") return "warn";
  return "neutral";
}
