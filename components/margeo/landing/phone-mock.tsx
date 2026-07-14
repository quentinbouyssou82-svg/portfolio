"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Clock,
  Euro,
  Fuel,
  Gauge,
  MapPin,
  Route,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useId, useRef } from "react";
import { AnimatedCounter } from "@/components/margeo/animated-counter";
import { VerdictBadge } from "@/components/margeo/verdict-badge";
import { cn } from "@/lib/margeo/utils";

interface PhoneMockProps {
  variant?: "default" | "hero";
}

const KPI_ITEMS = [
  { label: "Net", value: "6,10 €", icon: Euro },
  { label: "€/heure", value: "22,9 €", icon: Gauge },
  { label: "Coût", value: "1,80 €", icon: Fuel },
] as const;

const STAGGER = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.35 + i * 0.08,
      duration: 0.55,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

const FLOAT_LEFT = { y: [0, -9, 0] };
const FLOAT_RIGHT = { y: [0, 9, 0] };

function PhoneStatusBar() {
  return (
    <div
      className="relative z-10 flex items-center justify-between px-5 pt-3.5 pb-1 text-[10px] font-medium tracking-wide text-mg-faint"
      aria-hidden
    >
      <span>19:04</span>
      <span className="sr-only">Dynamic Island</span>
      <div className="flex items-center gap-1.5">
        <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden>
          <rect x="0" y="6" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.35" />
          <rect x="3" y="4" width="2" height="6" rx="0.5" fill="currentColor" opacity="0.55" />
          <rect x="6" y="2" width="2" height="8" rx="0.5" fill="currentColor" opacity="0.75" />
          <rect x="9" y="0" width="2" height="10" rx="0.5" fill="currentColor" />
        </svg>
        <span>5G</span>
        <span className="inline-flex items-center gap-0.5">
          <svg width="18" height="9" viewBox="0 0 18 9" aria-hidden>
            <rect
              x="0.5"
              y="0.5"
              width="14"
              height="8"
              rx="1.5"
              stroke="currentColor"
              strokeOpacity="0.45"
              fill="none"
            />
            <rect x="2" y="2" width="10" height="5" rx="0.75" fill="currentColor" />
            <rect x="15.5" y="2.5" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.45" />
          </svg>
          84%
        </span>
      </div>
    </div>
  );
}

function ScoreParticles({ active }: { active: boolean }) {
  if (!active) return null;

  const dots = [
    { top: "18%", left: "22%", delay: 0 },
    { top: "28%", right: "18%", delay: 0.4 },
    { bottom: "24%", left: "16%", delay: 0.8 },
    { bottom: "30%", right: "22%", delay: 1.2 },
    { top: "42%", left: "8%", delay: 0.6 },
    { top: "38%", right: "10%", delay: 1 },
  ];

  return (
    <>
      {dots.map((dot, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute size-1 rounded-full bg-mg-go/70"
          style={dot}
          animate={{ opacity: [0.15, 0.65, 0.15], scale: [0.8, 1.15, 0.8] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
}

function PremiumScoreRing({
  value,
  size,
  reduceMotion,
}: {
  value: number;
  size: number;
  reduceMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const gradientId = useId().replace(/:/g, "");
  const glowId = useId().replace(/:/g, "");

  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const target = circumference * (1 - value / 100);

  return (
    <div ref={ref} className="relative flex justify-center py-1">
      <div className="phone-score-halo" aria-hidden />
      <ScoreParticles active={!reduceMotion && inView} />

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="55%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(52,211,153,0.12)"
            strokeWidth={strokeWidth + 6}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: target } : undefined}
            transition={{ duration: 1.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            filter={`url(#${glowId})`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            className="text-[2.35rem] leading-none font-bold tracking-tight text-mg-foreground"
            animate={
              reduceMotion
                ? undefined
                : { scale: [1, 1.03, 1], opacity: [0.92, 1, 0.92] }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <AnimatedCounter value={value} duration={1.4} />
          </motion.p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-mg-faint uppercase">
            / 100
          </p>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg
      width="56"
      height="20"
      viewBox="0 0 56 20"
      className="mt-2"
      aria-hidden
    >
      <motion.path
        d="M0 14 L8 12 L16 15 L24 8 L32 10 L40 4 L48 6 L56 2"
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="phone-sparkline"
      />
    </svg>
  );
}

function FloatingStatCard({
  side,
  title,
  value,
  sub,
  sparkColor,
  badge,
  reduceMotion,
}: {
  side: "left" | "right";
  title: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  sparkColor: string;
  badge?: string;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      className={cn(
        "phone-float-stat absolute hidden w-[9.5rem] px-3.5 py-3 lg:block",
        side === "left" ? "-left-[5.5rem] top-[18%]" : "-right-[5.5rem] bottom-[26%]",
      )}
      initial={{ opacity: 0, x: side === "left" ? -12 : 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <motion.div
        animate={reduceMotion ? undefined : side === "left" ? FLOAT_LEFT : FLOAT_RIGHT}
        transition={{
          duration: side === "left" ? 5.2 : 6.1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: side === "right" ? 0.8 : 0,
        }}
      >
        {badge && (
          <span className="mb-1.5 inline-flex rounded-full border border-mg-go/25 bg-mg-go-soft px-2 py-0.5 text-[9px] font-semibold text-mg-go">
            {badge}
          </span>
        )}
        <p className="text-[10px] text-mg-faint">{title}</p>
        <p className="mt-0.5 text-sm font-bold text-mg-foreground">{value}</p>
        {sub}
        <Sparkline color={sparkColor} />
      </motion.div>
    </motion.div>
  );
}

/**
 * Maquette produit premium — HTML/CSS + Framer Motion.
 */
export function PhoneMock({ variant = "default" }: PhoneMockProps) {
  const isHero = variant === "hero";
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 140,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 140,
    damping: 22,
  });
  const tiltGlowX = useTransform(mouseX, [-0.5, 0.5], ["42%", "58%"]);
  const tiltGlowBackground = useTransform(
    tiltGlowX,
    (x) =>
      `radial-gradient(ellipse 55% 35% at ${x} 0%, rgba(255,255,255,0.14), transparent 70%)`,
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY, reduceMotion],
  );

  const resetTilt = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={stageRef}
      className={cn(
        "phone-mock-stage mx-auto",
        isHero ? "w-full max-w-[340px] sm:max-w-[360px]" : "w-[300px]",
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div className="phone-mock-ambient phone-mock-ambient-a" aria-hidden />
      <div className="phone-mock-ambient phone-mock-ambient-b" aria-hidden />

      <motion.div
        className="phone-mock-float"
        animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="phone-mock-device"
          style={{
            rotateX: reduceMotion ? 0 : rotateX,
            rotateY: reduceMotion ? 0 : rotateY,
            transformPerspective: 1400,
          }}
        >
          <div className="phone-mock-shadow" aria-hidden />

          <div className="phone-mock-frame">
            <div className="phone-mock-screen">
              <div className="phone-mock-island" aria-hidden />
              <div className="phone-mock-screen-glow" aria-hidden />
              <motion.div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{ background: tiltGlowBackground }}
                aria-hidden
              />
              <div className="phone-mock-grain" aria-hidden />

              <PhoneStatusBar />

              <div
                className="phone-mock-content"
                role="img"
                aria-label="Aperçu Uberly : score 84, verdict accepter, gain net 6,10 euros"
              >
                <motion.div
                  custom={0}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={STAGGER}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-[11px] font-medium text-mg-faint">
                      Uber Eats · à l&apos;instant
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-mg-foreground">
                      Verdict prêt
                    </p>
                  </div>
                  <VerdictBadge verdict="accept" />
                </motion.div>

                <motion.div
                  custom={1}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={STAGGER}
                  className="mt-4"
                >
                  <PremiumScoreRing
                    value={84}
                    size={isHero ? 148 : 136}
                    reduceMotion={reduceMotion}
                  />
                  <p className="-mt-1 text-center text-sm font-semibold tracking-tight text-mg-go">
                    Bonne
                  </p>
                </motion.div>

                <motion.div
                  custom={2}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={STAGGER}
                  className="mt-4"
                >
                  <motion.button
                    type="button"
                    className="phone-accept-btn flex min-h-12 items-center justify-center gap-2 px-4 py-3 text-[15px]"
                    whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    aria-label="Accepter la course (aperçu)"
                  >
                    Accepter
                  </motion.button>
                </motion.div>

                <motion.div
                  custom={3}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={STAGGER}
                  className="mt-3.5 grid grid-cols-3 gap-2"
                >
                  {KPI_ITEMS.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="phone-kpi-card px-2 py-2.5 text-center">
                      <span className="mx-auto flex size-6 items-center justify-center rounded-lg bg-white/[0.06]">
                        <Icon className="size-3 text-mg-muted" aria-hidden />
                      </span>
                      <p className="mt-1.5 text-[9px] font-medium tracking-wide text-mg-faint uppercase">
                        {label}
                      </p>
                      <p className="mt-0.5 text-[13px] font-bold tracking-tight text-mg-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  custom={4}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={STAGGER}
                  className="phone-glass-card mt-3 p-3.5"
                >
                  <div className="relative pl-1">
                    <div
                      className="absolute top-3 bottom-3 left-[0.65rem] w-px bg-gradient-to-b from-mg-accent/50 via-mg-border to-mg-go/40"
                      aria-hidden
                    />
                    <div className="relative flex gap-3 pb-3">
                      <span className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border border-mg-border bg-mg-surface shadow-[0_0_12px_rgba(129,140,248,0.15)]">
                        <UtensilsCrossed className="size-3.5 text-mg-accent" aria-hidden />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[10px] font-medium tracking-wide text-mg-faint uppercase">
                          Départ
                        </p>
                        <p className="truncate text-[12px] font-semibold text-mg-foreground">
                          Burger Père &amp; Fils
                        </p>
                      </div>
                    </div>
                    <div className="relative flex gap-3">
                      <span className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border border-mg-go/30 bg-mg-go-soft shadow-[0_0_12px_rgba(52,211,153,0.18)]">
                        <MapPin className="size-3.5 text-mg-go" aria-hidden />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[10px] font-medium tracking-wide text-mg-faint uppercase">
                          Destination
                        </p>
                        <p className="truncate text-[12px] font-semibold text-mg-foreground">
                          Quai Claude Bernard
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.05] bg-black/20 px-2.5 py-2">
                    <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-gradient-to-br from-mg-accent/10 via-transparent to-mg-go/10">
                      <svg
                        className="absolute inset-0 h-full w-full opacity-60"
                        viewBox="0 0 120 32"
                        preserveAspectRatio="none"
                        aria-hidden
                      >
                        <path
                          d="M0 24 C20 18, 35 26, 55 14 S90 22, 120 8"
                          fill="none"
                          stroke="rgba(129,140,248,0.35)"
                          strokeWidth="1.5"
                        />
                        <circle cx="55" cy="14" r="2.5" fill="#34d399" />
                      </svg>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-3 text-[10px] text-mg-faint">
                      <span className="inline-flex items-center gap-1">
                        <Route className="size-3" aria-hidden /> 3,2 km
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" aria-hidden /> 16 min
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  custom={5}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={STAGGER}
                  className="phone-verdict-ai mt-3 p-3.5"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-mg-go/25 bg-mg-go-soft">
                      <Sparkles className="size-3.5 text-mg-go" aria-hidden />
                    </span>
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-mg-go/25 bg-mg-go-soft/80 px-2 py-0.5 text-[9px] font-bold tracking-wide text-mg-go uppercase">
                        IA · Verdict
                      </span>
                      <p className="mt-2 text-[11px] leading-relaxed text-mg-foreground/92">
                        <span className="font-semibold text-mg-go">Accepter · </span>
                        Dépasse ton objectif. Retour facile.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <FloatingStatCard
            side="left"
            title="Gain du jour"
            badge="+ aujourd'hui"
            value={
              <span className="text-mg-go">
                +<AnimatedCounter value={68.4} decimals={2} suffix=" €" duration={1.6} />
              </span>
            }
            sparkColor="rgba(52,211,153,0.85)"
            reduceMotion={reduceMotion}
          />
          <FloatingStatCard
            side="right"
            title="Courses évitées"
            value={
              <>
                <AnimatedCounter value={9} duration={1.4} />{" "}
                <span className="text-[10px] font-normal text-mg-stop">
                  non rentables
                </span>
              </>
            }
            sparkColor="rgba(248,113,113,0.75)"
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
