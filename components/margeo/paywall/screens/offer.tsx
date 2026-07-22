"use client";

import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/margeo/ui/button";
import { TrialTimeline } from "@/components/margeo/paywall/trial-timeline";
import { PaywallSocialProof } from "@/components/margeo/paywall/social-proof";
import {
  PAYWALL_COPY,
  PAYWALL_GUARANTEES,
  PAYWALL_RESULT_FEATURES,
  PAYWALL_TRIAL_DAYS,
} from "@/lib/margeo/paywall/config";
import type { BillingPeriod } from "@/lib/margeo/billing/provider";
import {
  DRIVEELY_PLANS,
  formatPlanPrice,
  formatYearlyEquivalentMonthly,
  yearlySavingsPercent,
} from "@/lib/margeo/plans";
import { cn } from "@/lib/margeo/utils";

export function PaywallOfferScreen({
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
  const savePct = yearlySavingsPercent("pro");
  const yearly = pro.priceYearly ?? pro.priceMonthly * 12;

  return (
    <motion.div
      className="paywall-screen space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <header className="text-center">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
          <Sparkles className="size-3.5" />
          {PAYWALL_COPY.offerEyebrow}
        </p>
        <h1 className="text-gradient mt-3 text-3xl font-bold tracking-tight text-balance sm:text-[2.15rem]">
          {PAYWALL_COPY.offerTitle}
        </h1>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className={cn(
            "paywall-period-card text-left",
            billingPeriod === "yearly" && "paywall-period-card-active",
          )}
          onClick={() => onBillingPeriod("yearly")}
        >
          <span className="paywall-period-badge">{PAYWALL_COPY.annualBadge}</span>
          <p className="mt-3 text-sm font-semibold text-mg-foreground">
            {PAYWALL_COPY.annualLabel}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-mg-foreground">
            {formatPlanPrice(yearly)}
            <span className="text-sm font-medium text-mg-faint">/an</span>
          </p>
          <p className="mt-1 text-xs text-mg-muted">
            soit {formatYearlyEquivalentMonthly(yearly)}/mois
            {savePct > 0 ? ` · ${PAYWALL_COPY.annualSave} ${savePct} %` : ""}
          </p>
          <p className="mt-2 text-xs font-medium text-mg-accent">
            {PAYWALL_TRIAL_DAYS} jours gratuits
          </p>
        </button>

        <button
          type="button"
          className={cn(
            "paywall-period-card text-left",
            billingPeriod === "monthly" && "paywall-period-card-active",
          )}
          onClick={() => onBillingPeriod("monthly")}
        >
          <p className="mt-1 text-sm font-semibold text-mg-foreground">
            {PAYWALL_COPY.monthlyLabel}
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-mg-foreground">
            {formatPlanPrice(pro.priceMonthly)}
            <span className="text-sm font-medium text-mg-faint">/mois</span>
          </p>
          <p className="mt-2 text-xs font-medium text-mg-accent">
            {PAYWALL_TRIAL_DAYS} jours gratuits
          </p>
        </button>
      </div>

      <ul className="space-y-2.5">
        {PAYWALL_RESULT_FEATURES.map((f) => (
          <li key={f} className="flex gap-2.5 text-sm text-mg-foreground/90">
            <Check className="mt-0.5 size-4 shrink-0 text-mg-accent" />
            {f}
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-mg-border/80 bg-[var(--mg-surface-muted)] p-4">
        <p className="mb-3 text-xs font-semibold tracking-wide text-mg-faint uppercase">
          Comment ça se passe
        </p>
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
        <p className="text-center text-[11px] text-mg-faint">
          {PAYWALL_COPY.trialNote}
        </p>
        <button
          type="button"
          className="mx-auto block text-sm text-mg-muted underline-offset-2 hover:text-mg-foreground hover:underline"
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
