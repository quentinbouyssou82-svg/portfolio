"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Car,
  Clock,
  Euro,
  Fuel,
  HelpCircle,
  MapPin,
  Timer,
  TrendingDown,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/margeo/utils";

type BubbleTone = "neutral" | "accent" | "warn" | "danger" | "go";

type Bubble = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: BubbleTone;
  /** Desktop absolute placement (% of stage) */
  x: string;
  y: string;
  size: "xs" | "sm" | "md" | "lg";
  /** Float animation phase */
  float: 1 | 2 | 3 | 4;
  /** Mobile order in flow */
  order: number;
};

const BUBBLES: Bubble[] = [
  {
    id: "payout",
    label: "7 € annoncés",
    icon: Euro,
    tone: "accent",
    x: "8%",
    y: "18%",
    size: "lg",
    float: 1,
    order: 1,
  },
  {
    id: "timer",
    label: "15 s pour décider",
    icon: Timer,
    tone: "warn",
    x: "38%",
    y: "6%",
    size: "md",
    float: 2,
    order: 2,
  },
  {
    id: "wait",
    label: "+10 min d'attente",
    icon: Clock,
    tone: "warn",
    x: "68%",
    y: "14%",
    size: "md",
    float: 3,
    order: 3,
  },
  {
    id: "empty",
    label: "-3 km à vide",
    icon: MapPin,
    tone: "danger",
    x: "82%",
    y: "42%",
    size: "sm",
    float: 4,
    order: 4,
  },
  {
    id: "fuel",
    label: "Essence",
    icon: Fuel,
    tone: "danger",
    x: "58%",
    y: "48%",
    size: "xs",
    float: 1,
    order: 5,
  },
  {
    id: "wear",
    label: "Usure",
    icon: Wrench,
    tone: "neutral",
    x: "42%",
    y: "58%",
    size: "xs",
    float: 2,
    order: 6,
  },
  {
    id: "return",
    label: "Retour non payé",
    icon: Car,
    tone: "danger",
    x: "12%",
    y: "58%",
    size: "md",
    float: 3,
    order: 7,
  },
  {
    id: "net",
    label: "6,10 € net",
    icon: TrendingDown,
    tone: "warn",
    x: "28%",
    y: "78%",
    size: "lg",
    float: 4,
    order: 8,
  },
  {
    id: "hourly",
    label: "22,9 €/h",
    icon: Euro,
    tone: "go",
    x: "62%",
    y: "76%",
    size: "sm",
    float: 1,
    order: 9,
  },
  {
    id: "rentable",
    label: "Rentable ?",
    icon: HelpCircle,
    tone: "accent",
    x: "78%",
    y: "68%",
    size: "md",
    float: 2,
    order: 10,
  },
];

/** Pairs of bubble ids linked by luminous connectors (desktop). */
const CONNECTIONS: [string, string][] = [
  ["payout", "timer"],
  ["timer", "wait"],
  ["wait", "empty"],
  ["payout", "return"],
  ["return", "net"],
  ["fuel", "wear"],
  ["wear", "net"],
  ["empty", "rentable"],
  ["net", "hourly"],
  ["hourly", "rentable"],
];

const SIZE_CLASS = {
  xs: "problem-bubble--xs px-3 py-2 text-[11px] gap-1.5",
  sm: "problem-bubble--sm px-3.5 py-2.5 text-xs gap-2",
  md: "problem-bubble--md px-4 py-3 text-sm gap-2",
  lg: "problem-bubble--lg px-5 py-3.5 text-[0.9375rem] gap-2.5",
} as const;

const TONE_CLASS: Record<BubbleTone, string> = {
  neutral: "problem-bubble--neutral",
  accent: "problem-bubble--accent",
  warn: "problem-bubble--warn",
  danger: "problem-bubble--danger",
  go: "problem-bubble--go",
};

const ICON_CLASS: Record<BubbleTone, string> = {
  neutral: "text-mg-muted",
  accent: "text-mg-accent",
  warn: "text-mg-check",
  danger: "text-mg-stop",
  go: "text-mg-go",
};

const FLOAT_Y: Record<1 | 2 | 3 | 4, number[]> = {
  1: [0, -10, 0, 8, 0],
  2: [0, 8, -6, 10, 0],
  3: [0, -7, 5, -9, 0],
  4: [0, 9, -8, 6, 0],
};

const FLOAT_DURATION: Record<1 | 2 | 3 | 4, number> = {
  1: 9.5,
  2: 11.2,
  3: 10.4,
  4: 12.1,
};

function bubbleCenter(id: string): { x: number; y: number } | null {
  const b = BUBBLES.find((item) => item.id === id);
  if (!b) return null;
  return { x: parseFloat(b.x), y: parseFloat(b.y) };
}

/**
 * Constellation « Une soirée » — bulles flottantes pleine largeur.
 * Remplace l’ancienne timeline verticale de petites cartes.
 */
export function ProblemTimeline() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="problem-constellation relative w-full"
      aria-label="Paramètres croisés pendant une soirée de livraison"
    >
      <div className="problem-constellation-glow" aria-hidden />
      <div className="problem-constellation-glow problem-constellation-glow-b" aria-hidden />

      <svg
        className="problem-constellation-links pointer-events-none absolute inset-0 hidden h-full w-full md:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="problem-link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(129,140,248,0.55)" />
            <stop offset="50%" stopColor="rgba(167,139,250,0.22)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.32)" />
          </linearGradient>
        </defs>
        {CONNECTIONS.map(([a, b], i) => {
          const from = bubbleCenter(a);
          const to = bubbleCenter(b);
          if (!from || !to) return null;
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="url(#problem-link-grad)"
              strokeWidth={1.25}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={reduceMotion ? undefined : { opacity: 0.72 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.9,
                delay: 0.12 + i * 0.05,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            />
          );
        })}
        {!reduceMotion &&
          [
            { cx: 28, cy: 38, delay: 0 },
            { cx: 55, cy: 32, delay: 1.2 },
            { cx: 48, cy: 68, delay: 0.6 },
            { cx: 70, cy: 58, delay: 1.8 },
          ].map((p) => (
            <motion.circle
              key={`${p.cx}-${p.cy}`}
              cx={p.cx}
              cy={p.cy}
              r={0.35}
              fill="rgba(167,139,250,0.9)"
              animate={{ opacity: [0.12, 0.85, 0.12], r: [0.22, 0.42, 0.22] }}
              transition={{
                duration: 4.2,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
      </svg>

      <ul className="problem-constellation-stage relative mx-auto w-full list-none">
        {BUBBLES.map((bubble, i) => {
          const Icon = bubble.icon;
          return (
            <li
              key={bubble.id}
              className={cn(
                "problem-bubble-slot",
                `problem-bubble-slot--${bubble.id}`,
              )}
              style={
                {
                  "--bx": bubble.x,
                  "--by": bubble.y,
                  "--bo": bubble.order,
                } as CSSProperties
              }
            >
              <motion.div
                className={cn(
                  "problem-bubble inline-flex items-center rounded-2xl font-semibold tracking-tight",
                  SIZE_CLASS[bubble.size],
                  TONE_CLASS[bubble.tone],
                )}
                initial={
                  reduceMotion ? false : { opacity: 0, scale: 0.88, y: 16 }
                }
                whileInView={
                  reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }
                }
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.55,
                  delay: 0.05 + i * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
              >
                <motion.span
                  className="inline-flex items-center gap-[inherit]"
                  animate={
                    reduceMotion ? undefined : { y: FLOAT_Y[bubble.float] }
                  }
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          duration: FLOAT_DURATION[bubble.float],
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.18,
                        }
                  }
                >
                  <span
                    className={cn(
                      "problem-bubble-icon flex shrink-0 items-center justify-center rounded-xl",
                      bubble.size === "lg"
                        ? "size-9"
                        : bubble.size === "xs"
                          ? "size-6"
                          : "size-7",
                    )}
                  >
                    <Icon
                      className={cn(
                        ICON_CLASS[bubble.tone],
                        bubble.size === "lg"
                          ? "size-4"
                          : bubble.size === "xs"
                            ? "size-3"
                            : "size-3.5",
                      )}
                      aria-hidden
                    />
                  </span>
                  <span className="problem-bubble-label text-mg-foreground">
                    {bubble.label}
                  </span>
                </motion.span>
              </motion.div>
            </li>
          );
        })}
      </ul>

      <p className="problem-constellation-caption mx-auto mt-8 max-w-md px-2 text-center text-xs leading-relaxed text-mg-faint sm:mt-10 sm:text-sm">
        Uberly croise ces signaux en parallèle — pas un seul chiffre isolé —
        avant de proposer un verdict.
      </p>
    </div>
  );
}
