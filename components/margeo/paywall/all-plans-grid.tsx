"use client";

import { Check, Crown, Minus, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/margeo/ui/button";
import { Card } from "@/components/margeo/ui/card";
import {
  DRIVEELY_PLAN_ORDER,
  DRIVEELY_PLANS,
  DRIVEELY_PRICING_COPY,
  formatPlanPrice,
  type DriveelyPlanId,
} from "@/lib/margeo/plans";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

function checkoutHref(planId: DriveelyPlanId, yearly?: boolean) {
  const base = `${margeoRoutes.subscriptionCheckout}?plan=${planId}`;
  return yearly ? `${base}&period=yearly` : `${base}&period=monthly`;
}

/** Grille complète (Découverte / Pro / Elite) — accessible depuis le flow. */
export function PaywallAllPlansGrid({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-mg-muted hover:text-mg-foreground hover:underline"
        >
          ← Retour à mon offre
        </button>
        <h2 className="text-gradient mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
          {DRIVEELY_PRICING_COPY.title}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-mg-muted">
          {DRIVEELY_PRICING_COPY.subtitle}
        </p>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {DRIVEELY_PLAN_ORDER.map((id) => {
          const plan = DRIVEELY_PLANS[id];
          const isPro = plan.featured;
          return (
            <Card
              key={id}
              className={cn(
                "pricing-plan-card relative flex h-full flex-col p-6",
                isPro && "pricing-plan-card-featured",
                id === "elite" && "pricing-plan-card-elite",
              )}
            >
              {plan.badge && (
                <span
                  className={cn(
                    "absolute -top-3 left-1/2 z-[1] -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap",
                    isPro
                      ? "pricing-plan-badge-featured"
                      : "border border-mg-border bg-mg-card text-mg-muted",
                  )}
                >
                  {isPro && <Sparkles className="mr-1 inline size-3" />}
                  {plan.badge}
                </span>
              )}

              <div className={cn(isPro && "pt-2")}>
                <p className="flex items-center gap-2 text-lg font-semibold text-mg-foreground">
                  {plan.name}
                  {isPro && <Zap className="size-4 text-mg-accent" />}
                  {id === "elite" && <Crown className="size-4 text-mg-muted" />}
                </p>
                <p className="mt-1 text-sm text-mg-muted">{plan.tagline}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-mg-foreground">
                    {formatPlanPrice(plan.priceMonthly)}
                  </span>
                  <span className="text-sm text-mg-faint">/ mois</span>
                </p>
                {plan.priceYearly != null && (
                  <p className="mt-1 text-xs text-mg-faint">
                    ou {formatPlanPrice(plan.priceYearly)}/an
                  </p>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-mg-foreground/90">
                    <Check
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        isPro ? "text-mg-accent" : "text-mg-muted",
                      )}
                    />
                    {f}
                  </li>
                ))}
                {plan.missing?.map((f) => (
                  <li
                    key={f}
                    className="flex gap-2.5 text-mg-faint line-through decoration-mg-faint/40"
                  >
                    <Minus className="mt-0.5 size-4 shrink-0 opacity-50" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={
                  id === "discovery"
                    ? margeoRoutes.dashboard
                    : checkoutHref(id, isPro)
                }
                className="mt-7 block"
              >
                <Button
                  className={cn("w-full min-h-11", isPro && "landing-cta-primary")}
                  variant={
                    id === "discovery"
                      ? "secondary"
                      : isPro
                        ? "primary"
                        : "outline"
                  }
                >
                  {id === "discovery"
                    ? "Rester en Découverte"
                    : id === "pro"
                      ? "Passer en Pro →"
                      : "Passer en Elite →"}
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
