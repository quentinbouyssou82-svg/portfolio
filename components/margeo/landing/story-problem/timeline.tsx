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

export function ProblemTimeline() {
  return (
    <div className="problem-timeline relative mx-auto max-w-2xl">
      <ol className="space-y-3 sm:space-y-3.5">
        {TIMELINE_STEPS.map((step, i) => (
          <li key={step.title} className="relative flex gap-3.5 sm:gap-5">
            <div className="problem-timeline-rail relative flex w-10 shrink-0 justify-center sm:w-11">
              {i < TIMELINE_STEPS.length - 1 && (
                <span
                  className="problem-timeline-segment"
                  aria-hidden
                />
              )}
              <div className="relative z-[2] pt-2.5 sm:pt-3">
                <PremiumIconBadge
                  icon={step.icon}
                  tone={mapStepTone(step.tone)}
                  size="sm"
                  idle={false}
                />
              </div>
            </div>

            <PremiumCard
              index={i}
              className="min-w-0 flex-1 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4"
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
