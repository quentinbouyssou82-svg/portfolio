"use client";

import { ArrowLeft, Check, Crown, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { activatePlanAction } from "@/lib/margeo/actions/subscription";
import {
  DRIVEELY_PLANS,
  formatPlanPrice,
  type DriveelyPlanId,
} from "@/lib/margeo/plans";
import { margeoRoutes } from "@/lib/margeo/routes";
import { Button } from "@/components/margeo/ui/button";
import { Card, CardContent } from "@/components/margeo/ui/card";

export function CheckoutView({ planId }: { planId: DriveelyPlanId }) {
  const plan = DRIVEELY_PLANS[planId];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [billingPeriod] = useState<"monthly">("monthly");

  const activate = () => {
    startTransition(async () => {
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
      toast.success(`${plan.name} activé`, {
        description:
          planId === "discovery"
            ? "Tu es sur le plan gratuit."
            : "Paiement simulé (bêta). Ton abonnement est actif.",
      });
      router.push(margeoRoutes.subscription);
      router.refresh();
    });
  };

  return (
    <div className="app-page mx-auto max-w-lg space-y-5 pb-10">
      <Link
        href={margeoRoutes.premium}
        className="inline-flex items-center gap-2 text-sm text-mg-muted transition-colors hover:text-mg-foreground"
      >
        <ArrowLeft className="size-4" />
        Retour aux offres
      </Link>

      <header className="app-page-header">
        <p className="app-page-eyebrow">Checkout</p>
        <h1 className="app-page-title">Activer {plan.name}</h1>
        <p className="app-page-desc">
          Bêta : activation immédiate sans carte. Prêt pour Stripe plus tard.
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
            <div className="text-right">
              <p className="text-2xl font-bold text-mg-foreground">
                {formatPlanPrice(plan.priceMonthly)}
              </p>
              <p className="text-xs text-mg-faint">/ mois</p>
            </div>
          </div>

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

          <div className="rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] p-4">
            <p className="text-sm font-medium text-mg-foreground">Résumé</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-mg-muted">Plan {plan.name}</span>
              <span className="font-semibold text-mg-foreground">
                {formatPlanPrice(plan.priceMonthly)}/mois
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-mg-muted">Paiement (bêta)</span>
              <span className="text-mg-faint">Simulé · 0 € débité</span>
            </div>
          </div>

          <Button
            className="app-cta-primary w-full min-h-12"
            onClick={activate}
            loading={pending}
            disabled={pending}
          >
            Activer ce plan
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
