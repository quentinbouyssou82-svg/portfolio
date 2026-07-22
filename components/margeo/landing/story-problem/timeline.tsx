"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Car, Clock, Fuel, HelpCircle, MapPin, Timer } from "lucide-react";
import { cn } from "@/lib/margeo/utils";

type BubbleTone = "accent" | "warn" | "danger";

type Bubble = {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: BubbleTone;
  x: string;
  y: string;
  size: "sm" | "md" | "hero";
  float: 1 | 2 | 3 | 4;
  order: number;
};

const BUBBLES: Bubble[] = [
  {
    id: "rentable",
    label: "Rentable ?",
    icon: HelpCircle,
    tone: "accent",
    x: "50%",
    y: "48%",
    size: "hero",
    float: 1,
    order: 1,
  },
  {
    id: "timer",
    label: "15 s pour décider",
    icon: Timer,
    tone: "warn",
    x: "16%",
    y: "18%",
    size: "md",
    float: 2,
    order: 2,
  },
  {
    id: "wait",
    label: "+10 min d'attente",
    icon: Clock,
    tone: "warn",
    x: "82%",
    y: "20%",
    size: "md",
    float: 3,
    order: 3,
  },
  {
    id: "empty",
    label: "-3 km à vide",
    icon: MapPin,
    tone: "danger",
    x: "84%",
    y: "62%",
    size: "sm",
    float: 4,
    order: 4,
  },
  {
    id: "fuel",
    label: "Essence",
    icon: Fuel,
    tone: "danger",
    x: "16%",
    y: "64%",
    size: "sm",
    float: 2,
    order: 5,
  },
  {
    id: "return",
    label: "Retour non payé",
    icon: Car,
    tone: "danger",
    x: "50%",
    y: "88%",
    size: "md",
    float: 3,
    order: 6,
  },
];

const CONNECTIONS: [string, string][] = [
  ["timer", "rentable"],
  ["wait", "rentable"],
  ["empty", "rentable"],
  ["fuel", "rentable"],
  ["return", "rentable"],
];

const SIZE_CLASS = {
  sm: "problem-bubble--sm px-4 py-2.5 text-xs gap-2",
  md: "problem-bubble--md px-5 py-3 text-sm gap-2.5",
  hero: "problem-bubble--hero flex-col gap-3 px-10 py-9 text-center sm:px-14 sm:py-11",
} as const;

const TONE_CLASS: Record<BubbleTone, string> = {
  accent: "problem-bubble--accent",
  warn: "problem-bubble--warn",
  danger: "problem-bubble--danger",
};

const ICON_CLASS: Record<BubbleTone, string> = {
  accent: "text-mg-accent",
  warn: "text-mg-check",
  danger: "text-mg-stop",
};

const FLOAT_Y: Record<1 | 2 | 3 | 4, number[]> = {
  1: [0, -8, 0, 6, 0],
  2: [0, 7, -5, 9, 0],
  3: [0, -6, 4, -8, 0],
  4: [0, 8, -7, 5, 0],
};

const FLOAT_DURATION: Record<1 | 2 | 3 | 4, number> = {
  1: 10.5,
  2: 11.8,
  3: 9.8,
  4: 12.4,
};

function bubbleCenter(id: string): { x: number; y: number } | null {
  const b = BUBBLES.find((item) => item.id === id);
  if (!b) return null;
  return { x: parseFloat(b.x), y: parseFloat(b.y) };
}

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
            <stop offset="0%" stopColor="rgba(129,140,248,0.5)" />
            <stop offset="100%" stopColor="rgba(167,139,250,0.2)" />
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
              strokeWidth={1.2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduceMotion ? false : { opacity: 0 }}
              whileInView={reduceMotion ? undefined : { opacity: 0.65 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.9,
                delay: 0.2 + i * 0.06,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            />
          );
        })}
        {!reduceMotion &&
          [
            { cx: 34, cy: 32, delay: 0 },
            { cx: 64, cy: 34, delay: 1.1 },
            { cx: 50, cy: 68, delay: 0.55 },
          ].map((p) => (
            <motion.circle
              key={`${p.cx}-${p.cy}`}
              cx={p.cx}
              cy={p.cy}
              r={0.32}
              fill="rgba(167,139,250,0.85)"
              animate={{ opacity: [0.12, 0.8, 0.12], r: [0.2, 0.4, 0.2] }}
              transition={{
                duration: 4.4,
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
          const isHero = bubble.size === "hero";

          return (
            <li
              key={bubble.id}
              className={cn(
                "problem-bubble-slot",
                isHero && "problem-bubble-slot--hero",
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
              {/* Float moves the whole bubble shell */}
              <motion.div
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
                        delay: i * 0.22,
                      }
                }
              >
                <motion.div
                  className={cn(
                    "problem-bubble inline-flex items-center font-semibold tracking-tight",
                    SIZE_CLASS[bubble.size],
                    TONE_CLASS[bubble.tone],
                  )}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, scale: isHero ? 0.9 : 0.86 }
                  }
                  whileInView={
                    reduceMotion ? undefined : { opacity: 1, scale: 1 }
                  }
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.55,
                    delay: 0.04 + i * 0.06,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                >
                  {!isHero ? (
                    <span
                      className={cn(
                        "problem-bubble-icon flex shrink-0 items-center justify-center",
                        bubble.size === "sm" ? "size-6" : "size-7",
                      )}
                    >
                      <Icon
                        className={cn(
                          ICON_CLASS[bubble.tone],
                          bubble.size === "sm" ? "size-3" : "size-3.5",
                        )}
                        aria-hidden
                      />
                    </span>
                  ) : (
                    <span className="problem-bubble-icon problem-bubble-icon--hero flex size-11 items-center justify-center sm:size-12">
                      <Icon
                        className={cn(
                          ICON_CLASS[bubble.tone],
                          "size-5 sm:size-6",
                        )}
                        aria-hidden
                      />
                    </span>
                  )}

                  <span
                    className={cn(
                      "problem-bubble-label text-mg-foreground",
                      isHero &&
                        "text-[1.75rem] leading-none font-bold tracking-tight sm:text-[2.35rem]",
                    )}
                  >
                    {bubble.label}
                  </span>
                </motion.div>
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
