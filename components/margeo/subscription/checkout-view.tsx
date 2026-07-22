"use client";

import { ArrowLeft, Check, Crown, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TrialTimeline } from "@/components/margeo/paywall/trial-timeline";
import { activatePlanAction } from "@/lib/margeo/actions/subscription";
import type { BillingPeriod } from "@/lib/margeo/billing/provider";
import {
  PAYWALL_COPY,
  PAYWALL_GUARANTEES,
  PAYWALL_TRIAL_DAYS,
} from "@/lib/margeo/paywall/config";
import {
  DRIVEELY_PLANS,
  formatPlanPrice,
  formatYearlyEquivalentMonthly,
  yearlySavingsPercent,
  type DriveelyPlanId,
} from "@/lib/margeo/plans";
import { margeoRoutes } from "@/lib/margeo/routes";
import { Button } from "@/components/margeo/ui/button";
import { Card, CardContent } from "@/components/margeo/ui/card";
import { cn } from "@/lib/margeo/utils";
import { trackMargeoEvent } from "@/lib/margeo/analytics";

export function CheckoutView({
  planId,
  initialPeriod = "yearly",
}: {
  planId: DriveelyPlanId;
  initialPeriod?: BillingPeriod;
}) {
  const plan = DRIVEELY_PLANS[planId];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [billingPeriod, setBillingPeriod] =
    useState<BillingPeriod>(initialPeriod);

  const yearly = plan.priceYearly;
  const savePct = yearlySavingsPercent(planId);
  const isPaid = planId !== "discovery";

  const activate = () => {
    startTransition(async () => {
      trackMargeoEvent("driveely_paywall_trial_start", {
        plan: planId,
        billingPeriod,
      });
      const result = await activatePlanAction({
        planId,
        billingPeriod,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      const data = result.data;
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      toast.success(
        planId === "discovery" ? "Plan Découverte" : `${plan.name} activé`,
        {
          description:
            planId === "discovery"
              ? "Tu es sur le plan gratuit."
              : `${PAYWALL_TRIAL_DAYS} jours offerts · paiement simulé (bêta).`,
        },
      );
      router.push(margeoRoutes.subscription);
      router.refresh();
    });
  };

  return (
    <div className="app-page mx-auto max-w-lg space-y-5 pb-10">
      <Link
        href={`${margeoRoutes.premium}?step=offer`}
        className="inline-flex items-center gap-2 text-sm text-mg-muted transition-colors hover:text-mg-foreground"
      >
        <ArrowLeft className="size-4" />
        Retour à l&apos;offre
      </Link>

      <header className="app-page-header">
        <p className="app-page-eyebrow">Checkout</p>
        <h1 className="app-page-title">Débloquer {plan.name}</h1>
        <p className="app-page-desc">
          {isPaid
            ? `${PAYWALL_TRIAL_DAYS} jours gratuits. Bêta : aucune carte requise.`
            : "Activation du plan gratuit."}
        </p>
      </header>

      <Card className="overflow-hidden border-mg-accent/25">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-lg font-semibold text-mg-foreground">
                <Crown className="size-4 text-mg-accent" />
                {plan.name}
              </p>
              <p className="mt-1 text-sm text-mg-muted">{plan.tagline}</p>
            </div>
          </div>

          {isPaid && yearly != null ? (
            <div className="flex gap-2 rounded-xl border border-mg-border p-1">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg px-3 py-2.5 text-left text-sm transition",
                  billingPeriod === "yearly"
                    ? "bg-mg-accent/15 text-mg-accent"
                    : "text-mg-muted",
                )}
                onClick={() => setBillingPeriod("yearly")}
              >
                <span className="block font-semibold">Annuel</span>
                <span className="text-xs opacity-90">
                  {formatPlanPrice(yearly)}/an
                  {savePct > 0 ? ` · −${savePct} %` : ""}
                </span>
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg px-3 py-2.5 text-left text-sm transition",
                  billingPeriod === "monthly"
                    ? "bg-mg-accent/15 text-mg-accent"
                    : "text-mg-muted",
                )}
                onClick={() => setBillingPeriod("monthly")}
              >
                <span className="block font-semibold">Mensuel</span>
                <span className="text-xs opacity-90">
                  {formatPlanPrice(plan.priceMonthly)}/mois
                </span>
              </button>
            </div>
          ) : null}

          <ul className="space-y-2.5 border-t border-mg-border pt-4">
            {plan.features.map((f) => (
              <li
                key={f}
                className="flex gap-2.5 text-sm text-mg-foreground/90"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-mg-accent" />
                {f}
              </li>
            ))}
          </ul>

          {isPaid ? (
            <div className="rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] p-4">
              <TrialTimeline />
            </div>
          ) : null}

          <div className="rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] p-4">
            <p className="text-sm font-medium text-mg-foreground">Résumé</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-mg-muted">Plan {plan.name}</span>
              <span className="font-semibold text-mg-foreground">
                {billingPeriod === "yearly" && yearly != null
                  ? `${formatPlanPrice(yearly)}/an`
                  : `${formatPlanPrice(plan.priceMonthly)}/mois`}
              </span>
            </div>
            {billingPeriod === "yearly" && yearly != null ? (
              <p className="mt-1 text-xs text-mg-faint">
                soit {formatYearlyEquivalentMonthly(yearly)}/mois
              </p>
            ) : null}
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-mg-muted">Paiement (bêta)</span>
              <span className="text-mg-faint">Simulé · 0 € débité</span>
            </div>
          </div>

          {isPaid ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {PAYWALL_GUARANTEES.map((g) => (
                <li
                  key={g}
                  className="flex items-center gap-1 text-xs text-mg-muted"
                >
                  <Check className="size-3 text-mg-go" />
                  {g}
                </li>
              ))}
            </ul>
          ) : null}

          <Button
            className="app-cta-primary w-full min-h-12"
            onClick={activate}
            loading={pending}
            disabled={pending}
          >
            {isPaid ? PAYWALL_COPY.offerCtaUnlock : "Activer ce plan"}
          </Button>

          <p className="flex items-start gap-2 text-xs leading-relaxed text-mg-faint">
            <Shield className="mt-0.5 size-3.5 shrink-0" />
            Aucune carte requise pendant la bêta. L&apos;intégration Stripe
            remplacera uniquement cette étape d&apos;activation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
