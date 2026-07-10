"use client";

import { motion, useReducedMotion } from "framer-motion";
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
import { cn } from "@/lib/margeo/utils";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

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
  const reduceMotion = useReducedMotion();

  return (
    <div className="problem-timeline relative mx-auto max-w-2xl">
      <div
        className="problem-timeline-line absolute top-4 bottom-4 left-[1.12rem] w-px sm:left-[1.12rem]"
        aria-hidden
      />

      <ol className="space-y-0">
        {TIMELINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.title}
              initial={reduceMotion ? false : { opacity: 0, x: -16, filter: "blur(8px)" }}
              whileInView={reduceMotion ? undefined : { opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.04, ease: EASE }}
              className="problem-timeline-step relative flex gap-4 py-4 sm:gap-5 sm:py-5"
            >
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    "relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-full border shadow-[0_0_20px_rgba(0,0,0,0.35)]",
                    step.tone === "danger" && "border-mg-stop/40 bg-mg-stop-soft",
                    step.tone === "warn" && "border-mg-check/35 bg-mg-check-soft",
                    (!step.tone || step.tone === "neutral") && "border-mg-border bg-mg-card",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      step.tone === "danger" && "text-mg-stop",
                      step.tone === "warn" && "text-mg-check",
                      (!step.tone || step.tone === "neutral") && "text-mg-muted",
                    )}
                    aria-hidden
                  />
                </span>
              </div>

              <div className="problem-glass-card min-w-0 flex-1 rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4">
                <p className="text-sm font-semibold tracking-tight text-mg-foreground sm:text-base">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-mg-muted sm:text-sm">
                  {step.detail}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
