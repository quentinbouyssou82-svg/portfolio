"use client";

/* eslint-disable @next/next/no-img-element */

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

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

/** Écran de chargement de l'analyse : scan visuel + étapes IA. */
export function ScanOverlay({ previewUrl }: ScanOverlayProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      SCAN_DURATION_MS / STEPS.length
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[240px_1fr]"
    >
      {/* Aperçu scanné */}
      <div className="relative mx-auto h-64 w-full max-w-60 overflow-hidden rounded-2xl border border-accent/30 bg-card">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Capture en cours d'analyse"
            className="h-full w-full object-cover opacity-80"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-faint">
            <ScanLine className="size-8 text-accent/60" />
            <span className="text-xs">Capture d&apos;exemple</span>
          </div>
        )}
        {/* Ligne de scan */}
        <div className="animate-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent/25 to-transparent" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-accent/20 ring-inset" />
      </div>

      {/* Étapes */}
      <Card className="flex flex-col justify-center p-6">
        <p className="mb-5 flex items-center gap-2.5 font-semibold text-foreground">
          <Loader2 className="size-4 animate-spin text-accent" />
          Margeo analyse ta course
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
                      ? "flex size-5 items-center justify-center rounded-full bg-accent-soft"
                      : "flex size-5 items-center justify-center rounded-full border border-border"
                  }
                >
                  {i < step ? (
                    <Check className="size-3 text-accent" />
                  ) : i === step ? (
                    <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                  ) : null}
                </span>
                <span
                  className={i <= step ? "text-foreground" : "text-faint"}
                >
                  {label}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </Card>
    </motion.div>
  );
}
