"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import {
  Camera,
  Check,
  Clock,
  Euro,
  Fuel,
  Gauge,
  ImageIcon,
  MapPin,
  Route,
  Sparkles,
  Upload,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { LandingBackdrop } from "@/components/margeo/landing/landing-backdrop";
import { Logo } from "@/components/margeo/logo";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { Button } from "@/components/margeo/ui/button";
import { VerdictBadge } from "@/components/margeo/verdict-badge";
import { AnimatedCounter } from "@/components/margeo/animated-counter";
import {
  markHowItWorksSeenClient,
  resolveHowItWorksNext,
} from "@/lib/margeo/how-it-works";
import { markHowItWorksSeenAction } from "@/lib/margeo/actions/how-it-works";
import { cn } from "@/lib/margeo/utils";

const TOTAL = 5;

const STEPS = [
  {
    title: "Repère une course intéressante",
    body: "Quand une course apparaît, fais simplement une capture d'écran.",
  },
  {
    title: "Ouvre Driveely",
    body: "Ouvre Driveely en quelques secondes.",
  },
  {
    title: "Glisse ta capture",
    body: "Dépose l'image ou importe-la.",
  },
  {
    title: "L'IA analyse la course",
    body: "Driveely estime la rentabilité réelle de la course.",
  },
  {
    title: "Décide en toute confiance",
    body: "Accepte les bonnes courses. Refuse les mauvaises.",
  },
] as const;

const EASE: Transition = {
  duration: 0.38,
  ease: [0.21, 0.47, 0.32, 0.98],
};

function PhoneChrome({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("hiw-phone relative mx-auto w-[min(100%,280px)]", className)}>
      <div className="phone-mock-ambient phone-mock-ambient-a !opacity-60" aria-hidden />
      <div className="phone-mock-ambient phone-mock-ambient-b !opacity-40" aria-hidden />
      <div className="phone-mock-frame">
        <div className="phone-mock-screen flex aspect-[9/19.5] flex-col">
          <div className="phone-mock-island" aria-hidden />
          <div className="phone-mock-screen-glow" aria-hidden />
          <div className="phone-mock-grain" aria-hidden />
          <div className="phone-status-bar shrink-0" aria-hidden>
            <span className="phone-status-time">19:04</span>
            <div className="phone-status-right">
              <span className="phone-status-net">5G</span>
              <span className="phone-status-battery">
                <svg width="18" height="9" viewBox="0 0 18 9" aria-hidden>
                  <rect
                    x="0.5"
                    y="0.5"
                    width="14"
                    height="8"
                    rx="1.5"
                    stroke="currentColor"
                    strokeOpacity="0.5"
                    fill="none"
                  />
                  <rect x="2" y="2" width="10" height="5" rx="0.75" fill="currentColor" />
                </svg>
              </span>
            </div>
          </div>
          <div className="hiw-phone-content relative z-[2] min-h-0 flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function UberOfferScreen({
  flash,
  accepted,
  reduceMotion,
}: {
  flash?: boolean;
  accepted?: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="relative flex h-full flex-col bg-[#0c0c0e] px-3.5 pb-4">
      <div className="flex items-center justify-between">
        <PlatformLogo platform="Uber Eats" size="sm" showLabel />
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium text-white/55">
          Nouvelle course
        </span>
      </div>

      <motion.div
        className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#141418]"
        initial={false}
        animate={
          accepted
            ? { borderColor: "rgba(52,211,153,0.45)", boxShadow: "0 0 0 1px rgba(52,211,153,0.15)" }
            : {}
        }
      >
        <div className="flex items-center justify-between border-b border-white/6 px-3.5 py-2.5">
          <div>
            <p className="text-[11px] text-white/45">Gain estimé</p>
            <p className="text-[1.65rem] font-bold tracking-tight text-white">7,80 €</p>
          </div>
          <div className="text-right">
            <p className="inline-flex items-center gap-1 text-[11px] text-amber-300/90">
              <Clock className="size-3" /> 0:18
            </p>
            <p className="mt-0.5 text-[10px] text-white/40">à accepter</p>
          </div>
        </div>

        <div className="space-y-3 px-3.5 py-3">
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#06C167]/20 text-[#06C167]">
              <UtensilsCrossed className="size-3" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
                Restaurant
              </p>
              <p className="truncate text-[13px] font-semibold text-white">
                Burger Père &amp; Fils
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/8 text-white/70">
              <MapPin className="size-3" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wide text-white/40 uppercase">
                Livraison
              </p>
              <p className="truncate text-[13px] font-semibold text-white">
                Quai Claude Bernard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-2.5 py-2 text-[11px] text-white/55">
            <span className="inline-flex items-center gap-1">
              <Route className="size-3" /> 3,2 km
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> 16 min
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 px-3.5 pb-3.5">
          <button
            type="button"
            tabIndex={-1}
            className="rounded-xl border border-white/10 py-2.5 text-[13px] font-semibold text-white/50"
          >
            Refuser
          </button>
          <motion.button
            type="button"
            tabIndex={-1}
            className={cn(
              "rounded-xl py-2.5 text-[13px] font-semibold text-white",
              accepted ? "bg-mg-go" : "bg-[#06C167]",
            )}
            animate={
              accepted && !reduceMotion
                ? { scale: [1, 1.04, 1] }
                : undefined
            }
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {accepted ? "Acceptée" : "Accepter"}
          </motion.button>
        </div>
      </motion.div>

      {flash && !reduceMotion ? (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0] }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          aria-hidden
        />
      ) : null}

      {flash ? (
        <motion.div
          className="absolute right-4 bottom-8 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/55 backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={EASE}
        >
          <Camera className="size-5 text-white" />
        </motion.div>
      ) : null}
    </div>
  );
}

function DriveelyHomeScreen() {
  return (
    <div className="flex h-full flex-col bg-mg-background px-4 pb-5">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <span className="rounded-full border border-mg-border bg-mg-surface px-2 py-0.5 text-[10px] font-medium text-mg-faint">
          Safari
        </span>
      </div>
      <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...EASE, delay: 0.12 }}
          className="flex size-16 items-center justify-center rounded-2xl border border-mg-border bg-mg-card shadow-mg-card"
        >
          <Sparkles className="size-7 text-mg-go" />
        </motion.div>
        <motion.p
          className="mt-5 text-lg font-semibold tracking-tight text-mg-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...EASE, delay: 0.2 }}
        >
          Driveely
        </motion.p>
        <motion.p
          className="mt-1.5 max-w-[12rem] text-[12px] leading-relaxed text-mg-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...EASE, delay: 0.28 }}
        >
          Analyse ta course en quelques secondes
        </motion.p>
        <motion.div
          className="mt-6 w-full rounded-xl bg-mg-accent-strong py-3 text-[13px] font-semibold text-white"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...EASE, delay: 0.36 }}
        >
          Analyser une course
        </motion.div>
      </div>
    </div>
  );
}

function DropScreen({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-mg-background px-4 pb-5">
      <p className="text-[11px] font-medium text-mg-faint">Analyse</p>
      <p className="mt-0.5 text-[15px] font-semibold text-mg-foreground">
        Importe ta capture
      </p>

      <div className="relative mt-5 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-mg-border-strong bg-mg-surface/60 px-4 py-8">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-mg-border bg-mg-card">
            <Upload className="size-5 text-mg-accent" />
          </span>
          <p className="mt-3 text-[12px] font-medium text-mg-foreground">
            Dépose l&apos;image ici
          </p>
          <p className="mt-1 text-[10px] text-mg-faint">PNG, JPG · Uber Eats…</p>
        </div>

        <motion.div
          className="absolute top-2 right-2 z-10 w-[7.5rem] overflow-hidden rounded-xl border border-white/15 bg-[#141418] shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
          initial={
            reduceMotion
              ? { opacity: 1, x: 0, y: 0, rotate: -6 }
              : { opacity: 0, x: 48, y: -36, rotate: 12, scale: 0.85 }
          }
          animate={{ opacity: 1, x: 8, y: 56, rotate: -8, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.15 }}
        >
          <div className="border-b border-white/8 px-2 py-1.5">
            <PlatformLogo platform="Uber Eats" size="xs" showLabel />
          </div>
          <div className="px-2 py-2">
            <p className="text-[15px] font-bold text-white">7,80 €</p>
            <p className="mt-0.5 text-[9px] text-white/45">3,2 km · 16 min</p>
          </div>
          <div className="absolute inset-0 flex items-end justify-end p-1.5">
            <span className="rounded bg-black/55 p-1">
              <ImageIcon className="size-3 text-white/80" />
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AnalyzeScreen({
  phase,
  reduceMotion,
}: {
  phase: 0 | 1 | 2 | 3;
  reduceMotion: boolean | null;
}) {
  const gradientId = useId().replace(/:/g, "");
  const size = 112;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const score = 84;
  const target = circumference * (1 - score / 100);

  return (
    <div className="flex h-full flex-col bg-mg-background px-3.5 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-mg-faint">
          <PlatformLogo platform="Uber Eats" size="xs" />
          Analyse
        </div>
        {phase >= 2 ? <VerdictBadge verdict="accept" /> : null}
      </div>

      <div className="mt-3 flex flex-1 flex-col items-center justify-center">
        {phase === 0 ? (
          <motion.div
            className="relative flex size-28 items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-mg-accent/30"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.12, 1], opacity: [0.55, 0.15, 0.55] }
              }
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="absolute inset-3 rounded-full border border-mg-go/40"
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="relative size-7 text-mg-go" />
          </motion.div>
        ) : null}

        {phase === 1 ? (
          <motion.div
            className="w-full space-y-2.5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={EASE}
          >
            {[
              ["Gain brut", "7,80 €"],
              ["Distance", "3,2 km"],
              ["Temps", "16 min"],
              ["Coût estimé", "1,80 €"],
            ].map(([label, value], i) => (
              <motion.div
                key={label}
                className="flex items-center justify-between rounded-xl border border-mg-border bg-mg-card/80 px-3 py-2.5"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...EASE, delay: i * 0.07 }}
              >
                <span className="text-[12px] text-mg-muted">{label}</span>
                <span className="text-[13px] font-semibold text-mg-foreground">
                  {value}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : null}

        {phase >= 2 ? (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={EASE}
          >
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90" aria-hidden>
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  className="phone-score-track"
                  strokeWidth={strokeWidth}
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
                  animate={{ strokeDashoffset: target }}
                  transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.21, 0.47, 0.32, 0.98] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[1.75rem] font-bold tracking-tight text-mg-foreground">
                  {reduceMotion ? score : <AnimatedCounter value={score} duration={0.9} />}
                </p>
                <p className="text-[9px] font-semibold tracking-[0.16em] text-mg-faint uppercase">
                  / 100
                </p>
              </div>
            </div>
            <p className="mt-2 text-sm font-semibold text-mg-go">Bonne course</p>
          </motion.div>
        ) : null}

        {phase >= 3 ? (
          <motion.div
            className="mt-4 grid w-full grid-cols-3 gap-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...EASE, delay: 0.1 }}
          >
            {[
              { label: "Net", value: "6,10 €", icon: Euro },
              { label: "€/heure", value: "22,9 €", icon: Gauge },
              { label: "Coût", value: "1,80 €", icon: Fuel },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="phone-kpi-card px-1.5 py-2 text-center">
                <Icon className="mx-auto size-3 text-mg-muted" aria-hidden />
                <p className="mt-1 text-[8px] font-medium tracking-wide text-mg-faint uppercase">
                  {label}
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-mg-foreground">{value}</p>
              </div>
            ))}
          </motion.div>
        ) : null}
      </div>

      {phase === 0 ? (
        <p className="pb-1 text-center text-[11px] text-mg-faint">Lecture de la capture…</p>
      ) : null}
      {phase === 1 ? (
        <p className="pb-1 text-center text-[11px] text-mg-faint">Calcul de la rentabilité…</p>
      ) : null}
    </div>
  );
}

function DecideScreen({
  phase,
  reduceMotion,
}: {
  phase: 0 | 1;
  reduceMotion: boolean | null;
}) {
  if (phase === 1) {
    return <UberOfferScreen accepted reduceMotion={reduceMotion} />;
  }

  return (
    <div className="flex h-full flex-col bg-mg-background px-3.5 pb-4">
      <div className="flex items-center justify-between">
        <PlatformLogo platform="Uber Eats" size="xs" showLabel />
        <VerdictBadge verdict="accept" />
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
        <motion.span
          className="flex size-14 items-center justify-center rounded-2xl border border-mg-go/30 bg-mg-go-soft"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={EASE}
        >
          <Check className="size-7 text-mg-go" strokeWidth={2.5} />
        </motion.span>
        <motion.p
          className="mt-4 text-xl font-semibold tracking-tight text-mg-foreground"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...EASE, delay: 0.08 }}
        >
          Accepter
        </motion.p>
        <motion.p
          className="mt-1.5 max-w-[13rem] text-[12px] leading-relaxed text-mg-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...EASE, delay: 0.14 }}
        >
          Dépasse ton objectif. Retour facile.
        </motion.p>
        <motion.div
          className="phone-accept-btn mt-6 flex w-full min-h-11 items-center justify-center gap-2 px-4 text-[14px]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...EASE, delay: 0.2 }}
        >
          Accepter la course
        </motion.div>
      </div>
    </div>
  );
}

function StepVisual({
  step,
  reduceMotion,
}: {
  step: number;
  reduceMotion: boolean | null;
}) {
  const [analyzePhase, setAnalyzePhase] = useState<0 | 1 | 2 | 3>(0);
  const [decidePhase, setDecidePhase] = useState<0 | 1>(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setAnalyzePhase(0);
    setDecidePhase(0);
    setFlash(false);

    if (step === 0) {
      const t = window.setTimeout(() => setFlash(true), reduceMotion ? 0 : 450);
      return () => window.clearTimeout(t);
    }

    if (step === 3) {
      if (reduceMotion) {
        setAnalyzePhase(3);
        return;
      }
      const timers = [
        window.setTimeout(() => setAnalyzePhase(1), 700),
        window.setTimeout(() => setAnalyzePhase(2), 1400),
        window.setTimeout(() => setAnalyzePhase(3), 2100),
      ];
      return () => timers.forEach(clearTimeout);
    }

    if (step === 4) {
      if (reduceMotion) {
        setDecidePhase(1);
        return;
      }
      const t = window.setTimeout(() => setDecidePhase(1), 1100);
      return () => window.clearTimeout(t);
    }
  }, [step, reduceMotion]);

  return (
    <PhoneChrome>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="h-full"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={EASE}
        >
          {step === 0 ? (
            <UberOfferScreen flash={flash} reduceMotion={reduceMotion} />
          ) : null}
          {step === 1 ? <DriveelyHomeScreen /> : null}
          {step === 2 ? <DropScreen reduceMotion={reduceMotion} /> : null}
          {step === 3 ? (
            <AnalyzeScreen phase={analyzePhase} reduceMotion={reduceMotion} />
          ) : null}
          {step === 4 ? (
            <DecideScreen phase={decidePhase} reduceMotion={reduceMotion} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </PhoneChrome>
  );
}

export function HowItWorksTour({ nextPath }: { nextPath: string }) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const destination = resolveHowItWorksNext(nextPath);

  /** Only Passer / Commencer / Escape mark seen — never on mount. */
  const finish = useCallback(async () => {
    markHowItWorksSeenClient();
    try {
      await markHowItWorksSeenAction();
    } catch {
      // client cookie already set
    }
    // Hard nav: soft replace races with auth cookies on first visit post-login
    window.location.assign(destination);
  }, [destination]);

  const goNext = useCallback(() => {
    if (step >= TOTAL - 1) {
      void finish();
      return;
    }
    setStep((s) => s + 1);
  }, [finish, step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void finish();
      } else if (e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStep((s) => Math.max(0, s - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish, goNext]);

  const isLast = step === TOTAL - 1;
  const copy = STEPS[step];

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden bg-mg-background text-mg-foreground"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hiw-title"
      aria-describedby="hiw-body"
    >
      <LandingBackdrop />

      <div className="relative z-10 flex min-h-dvh flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center justify-between gap-3">
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => void finish()}
            className="min-h-11 rounded-xl px-3 text-[13px] font-medium text-mg-muted transition-colors hover:text-mg-foreground focus-visible:ring-2 focus-visible:ring-mg-accent/50 focus-visible:outline-none"
          >
            Passer
          </button>
        </header>

        <div className="mx-auto mt-4 w-full max-w-sm">
          <div className="hiw-progress h-1 overflow-hidden rounded-full bg-white/8" aria-hidden>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-mg-accent to-mg-go"
              initial={false}
              animate={{ width: `${((step + 1) / TOTAL) * 100}%` }}
              transition={reduceMotion ? { duration: 0 } : EASE}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-center gap-1.5" aria-hidden>
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-5 bg-mg-go"
                    : i < step
                      ? "w-1.5 bg-mg-go/45"
                      : "w-1.5 bg-white/20",
                )}
              />
            ))}
          </div>
          <p className="sr-only">
            Étape {step + 1} sur {TOTAL}
          </p>
        </div>

        <div className="mt-5 flex flex-1 flex-col items-center justify-center">
          <StepVisual step={step} reduceMotion={reduceMotion} />

          <div className="mt-7 w-full max-w-sm text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={EASE}
              >
                <p className="text-[11px] font-semibold tracking-[0.14em] text-mg-accent/90 uppercase">
                  Comment fonctionne Driveely ?
                </p>
                <h1
                  id="hiw-title"
                  className="mt-2 text-[1.35rem] leading-snug font-semibold tracking-tight text-mg-foreground sm:text-[1.5rem]"
                >
                  {copy.title}
                </h1>
                <p
                  id="hiw-body"
                  className="mx-auto mt-2 max-w-[20rem] text-[14px] leading-relaxed text-mg-muted"
                >
                  {copy.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mx-auto mt-6 flex w-full max-w-sm flex-col gap-2 pb-2">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={goNext}
          >
            {isLast ? "Commencer" : "Suivant"}
          </Button>
        </div>
      </div>
    </div>
  );
}
