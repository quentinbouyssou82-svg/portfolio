"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, RotateCcw, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnalysisResult } from "@/components/margeo/analyse/analysis-result";
import { Reveal } from "@/components/margeo/reveal";
import { SectionShell } from "@/components/margeo/landing/section-shell";
import { Button } from "@/components/margeo/ui/button";
import { Card } from "@/components/margeo/ui/card";
import { Spinner } from "@/components/margeo/ui/spinner";
import { margeoRoutes } from "@/lib/margeo/routes";
import type { RideAnalysis } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

const SCAN_STEPS = [
  "Lecture de l'image",
  "Analyse de la course",
  "Calcul de la rentabilité",
  "Génération du verdict",
] as const;

const SCAN_DURATION_MS = 2600;

const DEMO_ANALYSIS: RideAnalysis = {
  id: "landing-demo",
  offer: {
    id: "landing-demo-offer",
    platform: "Uber Eats",
    pickup: "McDonald's République",
    dropoff: "12 rue de la Paix",
    payout: 7.8,
    distanceKm: 4.1,
    durationMin: 18,
    emptyReturnKm: 0.8,
  },
  analyzedAt: new Date().toISOString(),
  grossGain: 7.8,
  estimatedCost: 1.7,
  netGain: 6.1,
  hourlyRate: 22.9,
  score: 84,
  verdict: "accept",
  explanation: "Cette course dépasse ton objectif horaire.",
  insights: [
    "Excellent €/km",
    "Distance courte",
    "Zone rentable",
    "Peu d'attente",
  ],
  scoreBreakdown: [],
};

type DemoStage = "idle" | "scanning" | "result";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

function DemoScanner({ previewUrl }: { previewUrl: string | null }) {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setStep(SCAN_STEPS.length - 1);
      setProgress(100);
      return;
    }

    const stepInterval = setInterval(
      () => setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)),
      SCAN_DURATION_MS / SCAN_STEPS.length,
    );

    const start = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, Math.round((elapsed / SCAN_DURATION_MS) * 100)));
    }, 40);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [reduceMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="mx-auto max-w-xl space-y-5"
    >
      <div className="app-scan-progress">
        <div
          className="app-scan-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-xs text-mg-faint">
        Analyse · {progress} %
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="scan-preview-frame relative mx-auto aspect-[9/16] w-full max-w-[200px] shrink-0 bg-mg-card sm:mx-0">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Capture en cours d'analyse"
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-b from-mg-accent/10 to-mg-surface/90 p-4 text-center">
              <span className="rounded-full border border-[#06c167]/30 bg-[#06c167]/15 px-2 py-0.5 text-[10px] font-bold text-[#06c167] shadow-[0_0_16px_rgba(6,193,103,0.2)]">
                Uber Eats
              </span>
              <p className="text-2xl font-bold text-mg-foreground">7,80 €</p>
              <p className="text-[10px] text-mg-faint">Capture exemple</p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-mg-accent/10" />
          <div className="animate-mg-scan absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-mg-accent/25 to-transparent" />
          <div className="pointer-events-none absolute inset-2.5 rounded-xl border border-mg-accent/20" />
        </div>

        <Card className="app-glass-surface min-w-0 flex-1 p-5">
          <p className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-mg-foreground">
            <Spinner size="sm" />
            Calcul en cours…
          </p>
          <ul className="space-y-3">
            {SCAN_STEPS.map((label, i) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 text-sm transition-all duration-300",
                  i <= step
                    ? "text-mg-foreground opacity-100"
                    : "text-mg-faint opacity-45",
                  i === step && "translate-x-0.5",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full transition-all duration-300",
                    i < step
                      ? "bg-mg-accent-soft shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                      : i === step
                        ? "border border-mg-accent/50 bg-mg-accent-soft/40"
                        : "border border-mg-border",
                  )}
                >
                  {i < step ? (
                    <Check className="size-3 text-mg-accent" />
                  ) : i === step ? (
                    <span className="size-1.5 animate-pulse rounded-full bg-mg-accent" />
                  ) : null}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </motion.div>
  );
}

function DemoDropzone({
  onStart,
  dragging,
  setDragging,
}: {
  onStart: (previewUrl: string | null) => void;
  dragging: boolean;
  setDragging: (v: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file?.type.startsWith("image/")) return;
      onStart(URL.createObjectURL(file));
    },
    [onStart],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="mx-auto max-w-2xl"
    >
      <div
        role="button"
        tabIndex={0}
        aria-label="Déposer une capture ou lancer la démo"
        onClick={() => onStart(null)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onStart(null);
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          "app-upload-zone landing-demo-dropzone",
          dragging && "app-upload-zone-active",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="app-upload-icon">
          <Upload className="size-7" strokeWidth={1.75} />
        </div>

        <p className="mt-5 text-lg font-semibold text-mg-foreground sm:text-xl">
          {dragging ? "Lâche ici" : "Glisse une capture Uber Eats ici"}
        </p>
        <p className="mt-2 text-sm text-mg-muted">
          ou clique pour essayer
        </p>
      </div>
    </motion.div>
  );
}

function DemoResult({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="mx-auto max-w-2xl"
    >
      <div className="landing-demo-result relative">
        <span className="landing-demo-badge">Démonstration</span>
        <AnalysisResult analysis={DEMO_ANALYSIS} />
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href={margeoRoutes.signup} className="w-full sm:w-auto">
          <Button size="lg" className="landing-cta-primary w-full min-h-12">
            Essayer avec une vraie capture
            <ArrowRight />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="lg"
          className="w-full min-h-12 sm:w-auto"
          onClick={onReset}
        >
          <RotateCcw />
          Rejouer la démo
        </Button>
      </div>
    </motion.div>
  );
}

export function InteractiveDemo() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<DemoStage>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStage("idle");
  }, [previewUrl]);

  const startDemo = useCallback(
    (url: string | null) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (previewUrl && previewUrl !== url) URL.revokeObjectURL(previewUrl);

      setPreviewUrl(url);
      setStage("scanning");

      const delay = reduceMotion ? 0 : SCAN_DURATION_MS;
      timerRef.current = setTimeout(() => {
        setStage("result");
      }, delay);
    },
    [previewUrl, reduceMotion],
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <SectionShell
      id="demo"
      eyebrow="Démo interactive"
      title="Teste Driveely en 15 secondes"
      description="Dépose une capture ou clique — le verdict s'affiche comme dans l'app."
      className="py-16 sm:py-24"
    >
      <Reveal>
        <div className="landing-demo-panel relative p-5 sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-mg-accent/15 blur-3xl"
            aria-hidden
          />
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <DemoDropzone
                key="dropzone"
                onStart={startDemo}
                dragging={dragging}
                setDragging={setDragging}
              />
            )}
            {stage === "scanning" && (
              <DemoScanner key="scanning" previewUrl={previewUrl} />
            )}
            {stage === "result" && (
              <DemoResult key="result" onReset={reset} />
            )}
          </AnimatePresence>
        </div>
      </Reveal>
    </SectionShell>
  );
}
