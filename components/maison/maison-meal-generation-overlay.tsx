"use client";

import { Brain, Check, ShoppingCart, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

export type GenerationStepId = "preferences" | "ai" | "finalize";

const STEPS: Array<{
  id: GenerationStepId;
  label: string;
  sub: string;
  icon: typeof Users;
}> = [
  {
    id: "preferences",
    label: "Analyse des préférences",
    sub: "Allergies, goûts, objectifs nutritionnels…",
    icon: Users,
  },
  {
    id: "ai",
    label: "Génération par Qwen",
    sub: "Menus variés sur 7 jours",
    icon: Brain,
  },
  {
    id: "finalize",
    label: "Finalisation",
    sub: "Liste de courses et budget",
    icon: ShoppingCart,
  },
];

type Props = {
  open: boolean;
  mode: "week" | "meal";
  error?: string | null;
  onDismissError?: () => void;
};

export function MaisonMealGenerationOverlay({ open, mode, error, onDismissError }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setProgress(8);
      return;
    }

    setActiveStep(0);
    setProgress(8);

    const stepTimer = window.setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, mode === "meal" ? 4_500 : 8_000);

    const progressTimer = window.setInterval(() => {
      setProgress((p) => (p >= 92 ? p : p + (mode === "meal" ? 4 : 2)));
    }, 600);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(progressTimer);
    };
  }, [open, mode]);

  if (!open && !error) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="maison-gen-title"
    >
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-md rounded-3xl bg-paper ring-1 ring-black/[0.06] shadow-xl overflow-hidden animate-rise">
        {error ? (
          <div className="p-6 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--destructive)]">Échec</p>
            <h2 id="maison-gen-title" className="font-serif text-xl text-ink">
              Génération interrompue
            </h2>
            <p className="text-sm text-ink/70 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={onDismissError}
              className="w-full py-3 rounded-2xl bg-ink text-cream text-sm font-medium"
            >
              Compris
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-sage-soft grid place-items-center maison-gen-pulse">
                <Sparkles className="h-5 w-5 text-sage" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-ash">
                  {mode === "week" ? "Planning hebdomadaire" : "Repas unique"}
                </p>
                <h2 id="maison-gen-title" className="font-serif text-xl text-ink">
                  L&apos;IA compose vos repas…
                </h2>
              </div>
            </div>

            <div className="h-1.5 rounded-full bg-[color-mix(in_oklab,var(--ink)_8%,white)] overflow-hidden">
              <div
                className="h-full rounded-full bg-sage transition-all duration-500 ease-out maison-gen-shimmer"
                style={{ width: `${progress}%` }}
              />
            </div>

            <ol className="space-y-3">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i < activeStep;
                const current = i === activeStep;
                return (
                  <li
                    key={step.id}
                    className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                      current ? "bg-sage-soft/80" : "bg-transparent"
                    }`}
                  >
                    <div
                      className={`size-8 rounded-xl grid place-items-center shrink-0 ${
                        done
                          ? "bg-sage text-cream"
                          : current
                            ? "bg-paper ring-1 ring-sage/30 text-sage"
                            : "bg-[color-mix(in_oklab,var(--ink)_6%,white)] text-ash"
                      }`}
                    >
                      {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className={`text-sm font-medium ${current ? "text-ink" : "text-ink/80"}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-ash mt-0.5">{step.sub}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="text-[11px] text-center text-ash">
              Qwen local · cela peut prendre 30 à 90 secondes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
