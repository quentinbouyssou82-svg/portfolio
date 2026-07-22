"use client";

import { Check, Crown, Minus, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/margeo/reveal";
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

interface CompareRow {
  label: string;
  discovery: string | boolean;
  pro: string | boolean;
  elite: string | boolean;
}

const COMPARE: CompareRow[] = [
  {
    label: "Analyses / jour",
    discovery: "2",
    pro: "Illimitées",
    elite: "Illimitées",
  },
  { label: "Score & verdict IA", discovery: true, pro: true, elite: true },
  {
    label: "Historique",
    discovery: "3 jours",
    pro: "Complet",
    elite: "Complet",
  },
  { label: "Dashboard & objectifs", discovery: false, pro: true, elite: true },
  { label: "Zones rentables", discovery: false, pro: true, elite: true },
  {
    label: "Sync multi-appareils",
    discovery: false,
    pro: true,
    elite: true,
  },
  { label: "Export CSV", discovery: false, pro: false, elite: true },
  { label: "Rapports avancés", discovery: false, pro: false, elite: true },
  { label: "Insights IA avancés", discovery: false, pro: false, elite: true },
  {
    label: "Support",
    discovery: "Communauté",
    pro: "Standard",
    elite: "Prioritaire",
  },
  { label: "Accès beta anticipé", discovery: false, pro: false, elite: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto size-4 text-mg-accent" />;
  if (value === false)
    return <Minus className="mx-auto size-4 text-mg-faint/50" />;
  return <span className="text-sm text-mg-foreground">{value}</span>;
}

function checkoutHref(planId: DriveelyPlanId) {
  return `${margeoRoutes.subscriptionCheckout}?plan=${planId}`;
}

export default function PremiumPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-8">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-mg-accent/25 bg-mg-accent-soft px-3.5 py-1.5 text-xs font-medium text-mg-accent">
          <Crown className="size-3.5" />
          {DRIVEELY_PRICING_COPY.eyebrow}
        </span>
        <h1 className="text-gradient mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {DRIVEELY_PRICING_COPY.title}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-mg-muted text-pretty">
          {DRIVEELY_PRICING_COPY.subtitle}
        </p>
        <p className="mt-3">
          <Link
            href={margeoRoutes.subscription}
            className="text-sm font-medium text-mg-accent hover:underline"
          >
            Voir mon abonnement →
          </Link>
        </p>
      </Reveal>

      <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-4 lg:pt-4">
        {DRIVEELY_PLAN_ORDER.map((id, i) => {
          const plan = DRIVEELY_PLANS[id];
          const isPro = plan.featured;

          return (
            <Reveal key={id} delay={i * 0.08}>
              <Card
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
                  </p>
                  <p className="mt-1 text-sm text-mg-muted">{plan.tagline}</p>
                  <p className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-mg-foreground">
                      {formatPlanPrice(plan.priceMonthly)}
                    </span>
                    <span className="text-sm text-mg-faint">/ mois</span>
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex gap-2.5 text-mg-foreground/90"
                    >
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

                <Link href={checkoutHref(id)} className="mt-7 block">
                  <Button
                    className={cn(
                      "w-full min-h-11",
                      isPro && "landing-cta-primary",
                    )}
                    variant={
                      id === "discovery"
                        ? "secondary"
                        : isPro
                          ? "primary"
                          : "outline"
                    }
                  >
                    {id === "discovery"
                      ? "Choisir Découverte"
                      : id === "pro"
                        ? "Passer en Pro"
                        : "Passer en Elite"}
                  </Button>
                </Link>
                {plan.ctaSecondary && id !== "discovery" && (
                  <p className="mt-2.5 text-center text-xs text-mg-faint">
                    Activation immédiate · paiement simulé (bêta)
                  </p>
                )}
              </Card>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.15}>
        <p className="mb-4 text-center text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase">
          {DRIVEELY_PRICING_COPY.comparisonTitle}
        </p>
        <Card className="overflow-x-auto">
          <div className="min-w-[36rem]">
            <div className="pricing-compare-head grid grid-cols-[1.5fr_1fr_1fr_1fr] border-b border-mg-border px-5 py-3.5 text-xs font-semibold tracking-wide text-mg-muted uppercase">
              <span>Fonctionnalité</span>
              <span className="text-center">Découverte</span>
              <span className="text-center text-mg-accent">Pro</span>
              <span className="text-center">Elite</span>
            </div>
            {COMPARE.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center px-5 py-3.5 text-center transition-colors hover:bg-[var(--mg-nav-hover)]",
                  i < COMPARE.length - 1 && "border-b border-mg-border",
                )}
              >
                <span className="text-left text-sm text-mg-foreground">
                  {row.label}
                </span>
                <FeatureValue value={row.discovery} />
                <FeatureValue value={row.pro} />
                <FeatureValue value={row.elite} />
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
