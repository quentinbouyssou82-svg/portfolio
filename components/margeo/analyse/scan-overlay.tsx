"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/margeo/ui/card";

const STEPS = [
  "Lecture de la capture d'écran…",
  "Extraction du gain, de la distance et du temps…",
  "Application de tes coûts réels…",
  "Génération de la recommandation…",
];

export const SCAN_DURATION_MS = 3200;

interface ScanOverlayProps {
  previewUrl: string | null;
}

/** Écran de chargement de l'analyse : scan visuel + progression. */
export function ScanOverlay({ previewUrl }: ScanOverlayProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      SCAN_DURATION_MS / STEPS.length,
    );

    const start = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, Math.round((elapsed / SCAN_DURATION_MS) * 100)));
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="mx-auto max-w-3xl space-y-4"
    >
      <div className="overflow-hidden rounded-full border border-mg-border bg-mg-card">
        <motion.div
          className="h-1.5 rounded-full bg-gradient-to-r from-mg-accent-strong to-mg-accent"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>
      <p className="text-center text-xs text-mg-faint">
        Analyse en cours · {progress} %
      </p>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <div className="relative mx-auto h-64 w-full max-w-60 overflow-hidden rounded-2xl border border-mg-accent/30 bg-mg-card">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Capture en cours d'analyse"
              className="h-full w-full object-cover opacity-80"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-mg-faint">
              <ScanLine className="size-8 text-mg-accent/60" />
              <span className="text-xs">Capture d&apos;exemple</span>
            </div>
          )}
          <div className="animate-mg-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-mg-accent/25 to-transparent" />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-mg-accent/20 ring-inset" />
          <motion.div
            className="absolute inset-0 rounded-2xl ring-2 ring-mg-accent/30"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <Card className="flex flex-col justify-center p-5 sm:p-6">
          <p className="mb-5 flex items-center gap-2.5 font-semibold text-mg-foreground">
            <Loader2 className="size-4 animate-spin text-mg-accent" />
            Uberly analyse ta course
          </p>
          <ul className="space-y-3.5">
            <AnimatePresence>
              {STEPS.map((label, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0.25, x: -8 }}
                  animate={{
                    opacity: i <= step ? 1 : 0.25,
                    x: i <= step ? 0 : -8,
                  }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={
                      i < step
                        ? "flex size-5 items-center justify-center rounded-full bg-mg-accent-soft"
                        : "flex size-5 items-center justify-center rounded-full border border-mg-border"
                    }
                  >
                    {i < step ? (
                      <Check className="size-3 text-mg-accent" />
                    ) : i === step ? (
                      <span className="size-1.5 animate-pulse rounded-full bg-mg-accent" />
                    ) : null}
                  </span>
                  <span
                    className={
                      i <= step ? "text-mg-foreground" : "text-mg-faint"
                    }
                  >
                    {label}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Card>
      </div>
    </motion.div>
  );
}
