"use client";

import { Check, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/margeo/ui/button";
import { TrialTimeline } from "@/components/margeo/paywall/trial-timeline";
import { PaywallSocialProof } from "@/components/margeo/paywall/social-proof";
import {
  PAYWALL_COPY,
  PAYWALL_GUARANTEES,
  PAYWALL_TRIAL_DAYS,
} from "@/lib/margeo/paywall/config";
import type { BillingPeriod } from "@/lib/margeo/billing/provider";
import {
  DRIVEELY_PLANS,
  formatPlanPrice,
  yearlySavingsPercent,
} from "@/lib/margeo/plans";
import { cn } from "@/lib/margeo/utils";

const ROWS: { label: string; free: string | boolean; pro: string | boolean }[] =
  [
    { label: "Analyses / jour", free: "2", pro: "Illimitées" },
    { label: "Décision avant d'accepter", free: true, pro: true },
    { label: "Historique", free: "3 jours", pro: "Complet" },
    { label: "Dashboard & objectifs", free: false, pro: true },
    { label: "Zones rentables", free: false, pro: true },
  ];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-mg-accent" />;
  if (value === false)
    return <Minus className="mx-auto size-4 text-mg-faint/50" />;
  return <span className="text-sm text-mg-foreground">{value}</span>;
}

export function PaywallCompareTableScreen({
  billingPeriod,
  onBillingPeriod,
  onCta,
  onSkip,
  onShowAllPlans,
}: {
  billingPeriod: BillingPeriod;
  onBillingPeriod: (period: BillingPeriod) => void;
  onCta: () => void;
  onSkip: () => void;
  onShowAllPlans: () => void;
}) {
  const pro = DRIVEELY_PLANS.pro;
  const yearly = pro.priceYearly ?? pro.priceMonthly * 12;
  const savePct = yearlySavingsPercent("pro");

  return (
    <motion.div
      className="paywall-screen space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <header className="text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
          Gratuit vs Pro
        </p>
        <h1 className="text-gradient mt-3 text-3xl font-bold tracking-tight text-balance sm:text-[2.15rem]">
          Ce que tu gagnes en Pro
        </h1>
      </header>

      <div className="overflow-hidden rounded-2xl border border-mg-border">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-mg-border bg-[var(--mg-surface-muted)] px-3 py-3 text-[11px] font-semibold tracking-wide text-mg-muted uppercase sm:px-4">
          <span>Fonction</span>
          <span className="text-center">Gratuit</span>
          <span className="text-center text-mg-accent">Pro</span>
        </div>
        {ROWS.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[1.4fr_1fr_1fr] items-center px-3 py-3 text-center sm:px-4",
              i < ROWS.length - 1 && "border-b border-mg-border",
            )}
          >
            <span className="text-left text-sm text-mg-foreground">
              {row.label}
            </span>
            <Cell value={row.free} />
            <Cell value={row.pro} />
          </div>
        ))}
      </div>

      <div className="flex gap-2 rounded-xl border border-mg-border p-1">
        <button
          type="button"
          className={cn(
            "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            billingPeriod === "yearly"
              ? "bg-mg-accent/15 text-mg-accent"
              : "text-mg-muted hover:text-mg-foreground",
          )}
          onClick={() => onBillingPeriod("yearly")}
        >
          Annuel · {formatPlanPrice(yearly)}
          {savePct > 0 ? ` (−${savePct} %)` : ""}
        </button>
        <button
          type="button"
          className={cn(
            "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
            billingPeriod === "monthly"
              ? "bg-mg-accent/15 text-mg-accent"
              : "text-mg-muted hover:text-mg-foreground",
          )}
          onClick={() => onBillingPeriod("monthly")}
        >
          Mensuel · {formatPlanPrice(pro.priceMonthly)}
        </button>
      </div>

      <p className="text-center text-sm text-mg-muted">
        {PAYWALL_TRIAL_DAYS} jours gratuits · puis{" "}
        {billingPeriod === "yearly"
          ? `${formatPlanPrice(yearly)}/an`
          : `${formatPlanPrice(pro.priceMonthly)}/mois`}
      </p>

      <div className="rounded-2xl border border-mg-border/80 bg-[var(--mg-surface-muted)] p-4">
        <TrialTimeline />
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {PAYWALL_GUARANTEES.map((g) => (
          <li
            key={g}
            className="flex items-center gap-1.5 text-xs text-mg-muted"
          >
            <Check className="size-3.5 text-mg-go" />
            {g}
          </li>
        ))}
      </ul>

      <PaywallSocialProof />

      <div className="space-y-2.5">
        <Button className="app-cta-primary w-full min-h-12" onClick={onCta}>
          {PAYWALL_COPY.offerCta}
        </Button>
        <button
          type="button"
          className="mx-auto block text-sm text-mg-muted underline-offset-2 hover:underline"
          onClick={onSkip}
        >
          {PAYWALL_COPY.offerSkip}
        </button>
        <button
          type="button"
          className="mx-auto block text-xs font-medium text-mg-accent hover:underline"
          onClick={onShowAllPlans}
        >
          {PAYWALL_COPY.offerAllPlans}
        </button>
      </div>
    </motion.div>
  );
}
