"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/margeo/ui/button";
import { PAYWALL_COPY } from "@/lib/margeo/paywall/config";
import type { PaywallPersonalization } from "@/lib/margeo/paywall/personalize";

export function PaywallPersonalizedScreen({
  perso,
  onContinue,
}: {
  perso: PaywallPersonalization;
  onContinue: () => void;
}) {
  const rows = [
    { label: "Véhicule", value: perso.vehicleLabel },
    { label: "Fréquence", value: perso.weeklyHoursLabel },
    {
      label: "Objectif",
      value: `${perso.targetHourly.toFixed(0)} €/h`,
    },
    {
      label: "Résultat attendu (30 j)",
      value: `~${perso.monthlyUpsideEur} € de courses à perte évitées`,
    },
  ];

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
          {PAYWALL_COPY.persoEyebrow}
        </p>
        <h1 className="text-gradient mt-3 text-3xl font-bold tracking-tight text-balance sm:text-[2.15rem]">
          {PAYWALL_COPY.persoTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-mg-muted text-pretty">
          {PAYWALL_COPY.persoSubtitle}
        </p>
      </header>

      <div className="paywall-perso-card space-y-0 overflow-hidden rounded-2xl border border-mg-border">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-start justify-between gap-4 px-4 py-3.5 ${
              i < rows.length - 1 ? "border-b border-mg-border/80" : ""
            }`}
          >
            <span className="text-sm text-mg-muted">{row.label}</span>
            <span className="max-w-[60%] text-right text-sm font-semibold text-mg-foreground">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] leading-relaxed text-mg-faint">
        {PAYWALL_COPY.disclaimer}
      </p>

      <Button className="app-cta-primary w-full min-h-12" onClick={onContinue}>
        {PAYWALL_COPY.persoContinue}
      </Button>
    </motion.div>
  );
}
