"use client";

import { motion } from "framer-motion";
import { Clock, Shield, Target } from "lucide-react";
import { Button } from "@/components/margeo/ui/button";
import {
  PAYWALL_COPY,
  PAYWALL_VISION_BULLETS,
} from "@/lib/margeo/paywall/config";
import type { PaywallPersonalization } from "@/lib/margeo/paywall/personalize";

const ICONS = [Clock, Shield, Target];

export function PaywallVisionScreen({
  perso,
  onContinue,
}: {
  perso: PaywallPersonalization;
  onContinue: () => void;
}) {
  return (
    <motion.div
      className="paywall-screen space-y-7"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <header className="text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
          {PAYWALL_COPY.visionEyebrow}
        </p>
        <h1 className="text-gradient mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {PAYWALL_COPY.visionTitle}
        </h1>
        {perso.hasProfile ? (
          <p className="mx-auto mt-3 max-w-md text-sm text-mg-muted text-pretty">
            Objectif{" "}
            <span className="font-semibold text-mg-foreground">
              {perso.targetHourly.toFixed(0)} €/h
            </span>
            {" · "}
            ~{perso.hoursSavedPerWeek} h/semaine mieux utilisées (indicatif)
          </p>
        ) : null}
      </header>

      <ul className="space-y-3">
        {PAYWALL_VISION_BULLETS.map((b, i) => {
          const Icon = ICONS[i] ?? Target;
          return (
            <li key={b.title} className="paywall-benefit-row">
              <span className="paywall-benefit-icon">
                <Icon className="size-4 text-mg-accent" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-mg-foreground">{b.title}</p>
                <p className="mt-0.5 text-sm text-mg-muted">{b.body}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <Button className="app-cta-primary w-full min-h-12" onClick={onContinue}>
        {PAYWALL_COPY.visionContinue}
      </Button>
    </motion.div>
  );
}
