"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Car,
  Coffee,
  Fuel,
  MapPin,
  Navigation,
  Smartphone,
  TrendingDown,
  Wrench,
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
    title: "Notification Uber",
    detail: "7 € s'affichent en vert. Tu as 15 secondes.",
    tone: "neutral",
  },
  {
    icon: Smartphone,
    title: "Tu acceptes",
    detail: "Un tap. Pas le temps de réfléchir.",
    tone: "neutral",
  },
  {
    icon: Car,
    title: "Tu roules",
    detail: "Kilomètres, feux, stress — le compteur tourne.",
    tone: "neutral",
  },
  {
    icon: Navigation,
    title: "Embouteillages",
    detail: "Le temps estimé explose. Ton €/h s'effondre.",
    tone: "warn",
  },
  {
    icon: Coffee,
    title: "Attente restaurant",
    detail: "5, 10, 15 minutes debout. Non payées.",
    tone: "warn",
  },
  {
    icon: MapPin,
    title: "Retour à vide",
    detail: "La zone est morte. Personne ne te le paie.",
    tone: "danger",
  },
  {
    icon: Fuel,
    title: "Essence",
    detail: "−1,20 € de carburant sur cette course.",
    tone: "danger",
  },
  {
    icon: Wrench,
    title: "Usure",
    detail: "Pneus, freins, entretien — invisible sur l'écran.",
    tone: "danger",
  },
  {
    icon: TrendingDown,
    title: "Presque gratuit",
    detail: "Tu réalises que tu as travaillé pour rien.",
    tone: "danger",
  },
];

export function ProblemTimeline() {
  return (
    <div className="problem-timeline relative mx-auto max-w-2xl">
      <div
        className="problem-timeline-line absolute top-4 bottom-4 left-[1.25rem] w-px"
        aria-hidden
      />

      <ol className="space-y-3 sm:space-y-4">
        {TIMELINE_STEPS.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 sm:gap-5">
            <div className="relative z-[2] pt-3">
              <PremiumIconBadge
                icon={step.icon}
                tone={mapStepTone(step.tone)}
                size="sm"
              />
            </div>

            <PremiumCard
              index={i}
              className="min-w-0 flex-1 rounded-2xl px-4 py-4 sm:px-5 sm:py-4"
            >
              <p className="text-sm font-semibold tracking-tight text-mg-foreground sm:text-base">
                {step.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-mg-muted sm:text-sm">
                {step.detail}
              </p>
            </PremiumCard>
          </li>
        ))}
      </ol>
    </div>
  );
}
