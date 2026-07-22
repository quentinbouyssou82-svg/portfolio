"use client";

import { motion } from "framer-motion";
import {
  PAYWALL_REMINDER_DAY,
  PAYWALL_TRIAL_DAYS,
} from "@/lib/margeo/paywall/config";

const STEPS = [
  {
    label: "Aujourd'hui",
    body: "Activation de ton essai gratuit",
  },
  {
    label: `Jour ${PAYWALL_REMINDER_DAY}`,
    body: "Rappel avant renouvellement",
  },
  {
    label: `Jour ${PAYWALL_TRIAL_DAYS}`,
    body: "Début de l'abonnement (si tu continues)",
  },
] as const;

export function TrialTimeline() {
  return (
    <ol className="paywall-timeline space-y-0">
      {STEPS.map((step, i) => (
        <li key={step.label} className="paywall-timeline-item relative flex gap-3 pb-5 last:pb-0">
          <div className="flex flex-col items-center">
            <motion.span
              className="paywall-timeline-dot"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08 * i, duration: 0.35 }}
            />
            {i < STEPS.length - 1 && (
              <span className="paywall-timeline-line" aria-hidden />
            )}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-xs font-semibold tracking-wide text-mg-accent uppercase">
              {step.label}
            </p>
            <p className="mt-0.5 text-sm text-mg-foreground/90">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
