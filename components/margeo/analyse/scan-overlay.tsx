"use client";

/* eslint-disable @next/next/no-img-element */

import { Check, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "@/components/margeo/ui/card";
import { Spinner } from "@/components/margeo/ui/spinner";
import { cn } from "@/lib/margeo/utils";

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
    <div className="app-fade-in mx-auto max-w-3xl space-y-4">
      <div className="app-scan-progress">
        <div
          className="app-scan-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-xs text-mg-faint">
        Analyse en cours · {progress} %
      </p>

      <div className="flex flex-col gap-4">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[220px] overflow-hidden rounded-2xl border border-mg-accent/25 bg-mg-card">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Capture en cours d'analyse"
              className="h-full w-full object-cover opacity-85"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-mg-faint">
              <ScanLine className="size-8 text-mg-accent/60" />
              <span className="text-xs">Capture d&apos;exemple</span>
            </div>
          )}
          <div className="animate-mg-scan absolute inset-x-0 h-20 bg-gradient-to-b from-transparent via-mg-accent/20 to-transparent" />
        </div>

        <Card className="app-glass-surface p-5">
          <p className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-mg-foreground">
            <Spinner size="sm" />
            Uberly analyse ta course
          </p>
          <ul className="space-y-3">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-3 text-sm transition-opacity duration-200",
                  i <= step ? "text-mg-foreground opacity-100" : "text-mg-faint opacity-45",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    i < step
                      ? "bg-mg-accent-soft"
                      : "border border-mg-border",
                  )}
                >
                  {i < step ? (
                    <Check className="size-3 text-mg-accent" />
                  ) : i === step ? (
                    <span className="size-1.5 rounded-full bg-mg-accent" />
                  ) : null}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
