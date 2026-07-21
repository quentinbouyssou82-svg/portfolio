"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Coffee,
  Fuel,
  MapPin,
  Smartphone,
  TrendingDown,
} from "lucide-react";
import {
  mapStepTone,
  PremiumCard,
  PremiumIconBadge,
} from "@/components/margeo/landing/story-problem/premium-card";

export const TIMELINE_STEPS: {
  icon: LucideIcon;
  title: string;
  detail: string;
  tone?: "neutral" | "warn" | "danger";
}[] = [
  {
    icon: Bell,
    title: "Notification",
    detail: "7 €. 15 secondes.",
    tone: "neutral",
  },
  {
    icon: Smartphone,
    title: "Tu acceptes",
    detail: "Un tap. Sans calculer.",
    tone: "neutral",
  },
  {
    icon: Coffee,
    title: "Attente",
    detail: "10 min non payées.",
    tone: "warn",
  },
  {
    icon: MapPin,
    title: "Retour à vide",
    detail: "Km perdu. Invisible.",
    tone: "danger",
  },
  {
    icon: Fuel,
    title: "Coûts",
    detail: "Essence + usure.",
    tone: "danger",
  },
  {
    icon: TrendingDown,
    title: "Résultat",
    detail: "Presque rien net.",
    tone: "danger",
  },
];

/**
 * Timeline « Une soirée » — une seule ligne continue centrée sur les badges
 * (même rendu Desktop / Mobile, colonnes flex responsive).
 */
export function ProblemTimeline() {
  return (
    <div className="problem-timeline relative mx-auto max-w-2xl">
      {/*
        left-5 = centre d’une colonne w-10 (2.5rem).
        sm:left-[1.375rem] = centre d’une colonne w-11 (2.75rem).
      */}
      <div
        className="problem-timeline-line absolute top-4 bottom-4 left-5 w-[2px] -translate-x-1/2 sm:left-[1.375rem]"
        aria-hidden
      />

      <ol className="space-y-3 sm:space-y-4">
        {TIMELINE_STEPS.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 sm:gap-5">
            <div className="relative z-[2] flex w-10 shrink-0 justify-center pt-3 sm:w-11">
              <PremiumIconBadge
                icon={step.icon}
                tone={mapStepTone(step.tone)}
                size="sm"
                idle={false}
              />
            </div>

            <PremiumCard
              index={i}
              className="min-w-0 flex-1 rounded-2xl px-4 py-4 sm:px-5 sm:py-4"
            >
              <p className="text-sm font-semibold tracking-tight text-mg-foreground sm:text-base">
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mg-muted sm:text-sm">
                {step.detail}
              </p>
            </PremiumCard>
          </li>
        ))}
      </ol>
    </div>
  );
}
