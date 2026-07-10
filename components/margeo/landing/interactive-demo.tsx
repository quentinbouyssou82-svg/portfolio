"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  Loader2,
  MapPin,
  Route,
  ScanLine,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ProgressRing } from "@/components/margeo/progress-ring";
import { Reveal } from "@/components/margeo/reveal";
import { SectionShell } from "@/components/margeo/landing/section-shell";
import { VerdictBadge } from "@/components/margeo/verdict-badge";
import { LandingCta } from "@/components/margeo/landing/landing-cta";

const STAGES = [
  { id: "capture", label: "Capture" },
  { id: "scan", label: "Scan IA" },
  { id: "result", label: "Verdict" },
  { id: "decision", label: "Décision" },
] as const;

type StageId = (typeof STAGES)[number]["id"];

const STAGE_MS = 2800;

function CaptureMock() {
  return (
    <div className="mx-auto w-full max-w-[240px] rounded-2xl border border-mg-border-strong bg-[#0c0c0e] p-2 shadow-mg-card">
      <div className="rounded-xl border border-mg-border bg-mg-surface px-3 py-3">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#06c167]/20 px-2 py-0.5 text-[10px] font-semibold text-[#06c167]">
            Uber Eats
          </span>
          <span className="text-[10px] text-mg-faint">Nouvelle course</span>
        </div>
        <p className="mt-3 text-2xl font-bold text-mg-foreground">7,80 €</p>
        <p className="text-[10px] text-mg-faint">Gain estimé</p>
        <div className="mt-3 space-y-1.5 rounded-lg border border-mg-border bg-mg-card p-2.5">
          <p className="flex items-center gap-1.5 text-[10px] text-mg-muted">
            <MapPin className="size-3 text-mg-accent" />
            McDonald&apos;s République
          </p>
          <p className="flex items-center gap-1.5 text-[10px] text-mg-muted">
            <MapPin className="size-3 text-mg-faint" />
            12 rue de la Paix
          </p>
          <div className="flex gap-3 text-[10px] text-mg-faint">
            <span className="inline-flex items-center gap-1">
              <Route className="size-3" /> 4,1 km
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> 18 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanMock() {
  return (
    <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl border border-mg-accent/40 bg-[#0c0c0e] p-2">
      <div className="rounded-xl border border-mg-border bg-mg-surface px-3 py-3 opacity-60">
        <p className="text-2xl font-bold text-mg-foreground">7,80 €</p>
        <p className="mt-2 text-[10px] text-mg-faint">McDonald&apos;s → 12 rue de la Paix</p>
      </div>
      <div className="animate-mg-scan absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-mg-accent/30 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center bg-mg-background/50 backdrop-blur-[2px]">
        <div className="flex items-center gap-2 rounded-full border border-mg-accent/30 bg-mg-background/90 px-3 py-1.5 text-xs font-medium text-mg-accent">
          <Loader2 className="size-3.5 animate-spin" />
          Analyse en cours…
        </div>
      </div>
    </div>
  );
}

function ResultMock() {
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-2xl border border-mg-go/30 bg-mg-card p-4 shadow-mg-glow">
      <div className="flex items-center justify-between">
        <VerdictBadge verdict="accept" size="md" />
        <span className="text-[10px] text-mg-faint">Uberly</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <ProgressRing value={84} size={80} strokeWidth={7}>
          <span className="text-lg font-bold text-mg-foreground">84</span>
        </ProgressRing>
        <div>
          <p className="text-sm font-semibold text-mg-go">Bonne course</p>
          <p className="mt-0.5 text-xl font-bold text-mg-foreground">
            6,10 € <span className="text-sm font-medium text-mg-muted">net</span>
          </p>
          <p className="text-xs text-mg-faint">22,9 €/h · coût 1,80 €</p>
        </div>
      </div>
      <p className="mt-3 rounded-lg border border-mg-accent/20 bg-mg-accent-soft/50 p-2.5 text-[11px] leading-relaxed text-mg-muted">
        Dépasse ton objectif horaire. Course proche, retour facile.
      </p>
    </div>
  );
}

function DecisionMock() {
  return (
    <div className="mx-auto flex w-full max-w-[280px] flex-col items-center gap-3">
      <ResultMock />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-mg-go px-4 py-3 text-sm font-semibold text-[#04120c] shadow-[0_0_24px_rgba(52,211,153,0.35)]"
      >
        <Check className="size-4" />
        Accepter — bonne décision
        <ArrowRight className="size-4" />
      </motion.div>
    </div>
  );
}

export function InteractiveDemo() {
  const reduceMotion = useReducedMotion();
  const [stageIndex, setStageIndex] = useState(0);
  const stage = STAGES[stageIndex].id;

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => {
      setStageIndex((i) => (i + 1) % STAGES.length);
    }, STAGE_MS);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <SectionShell
      id="demo"
      eyebrow="Démonstration"
      title="De la capture au verdict en 4 étapes"
      description="Exactement ce que tu vivras dans l'app — en moins de 10 secondes."
    >
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex justify-center gap-2 overflow-x-auto pb-1 sm:gap-3">
            {STAGES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageIndex(i)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all sm:text-sm ${
                  stageIndex === i
                    ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                    : "border-mg-border text-mg-muted hover:border-mg-border-strong"
                }`}
              >
                <span
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    stageIndex >= i
                      ? "bg-mg-accent text-[#04120c]"
                      : "bg-mg-border text-mg-faint"
                  }`}
                >
                  {i + 1}
                </span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative min-h-[320px] rounded-3xl border border-mg-border bg-mg-card/60 p-8 backdrop-blur-sm sm:min-h-[360px] sm:p-12">
            <div className="absolute top-4 right-4 hidden items-center gap-1.5 text-xs text-mg-faint sm:flex">
              <ScanLine className="size-3.5 text-mg-accent" />
              Démo interactive
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex min-h-[240px] items-center justify-center"
              >
                {stage === "capture" && <CaptureMock />}
                {stage === "scan" && <ScanMock />}
                {stage === "result" && <ResultMock />}
                {stage === "decision" && <DecisionMock />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 h-1 overflow-hidden rounded-full bg-mg-border">
              <motion.div
                className="h-full bg-gradient-to-r from-mg-accent-strong to-mg-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <LandingCta primaryOnly className="justify-center" />
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
