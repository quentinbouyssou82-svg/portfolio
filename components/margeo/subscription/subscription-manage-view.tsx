"use client";

import {
  Check,
  Crown,
  Download,
  History,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  cancelSubscriptionAction,
  changePlanAction,
} from "@/lib/margeo/actions/subscription";
import type { PlanEntitlements } from "@/lib/margeo/billing/entitlements";
import type {
  SubscriptionEvent,
  UserSubscription,
} from "@/lib/margeo/billing/types";
import {
  UBERLY_PLAN_ORDER,
  UBERLY_PLANS,
  formatPlanPrice,
} from "@/lib/margeo/plans";
import { margeoRoutes } from "@/lib/margeo/routes";
import { Button } from "@/components/margeo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/margeo/ui/card";
import { cn } from "@/lib/margeo/utils";

const EVENT_LABELS: Record<string, string> = {
  created: "Création",
  activated: "Activation",
  upgraded: "Upgrade",
  downgraded: "Downgrade",
  canceled: "Annulation",
  reactivated: "Réactivation",
  renewed: "Renouvellement",
  expired: "Expiration",
  provider_sync: "Sync provider",
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ENTITLEMENT_ROWS: {
  key: keyof PlanEntitlements;
  label: string;
}[] = [
  { key: "canUnlimitedAnalysis", label: "Analyses illimitées" },
  { key: "canUnlimitedHistory", label: "Historique complet" },
  { key: "canDashboardFull", label: "Dashboard complet" },
  { key: "canZones", label: "Zones rentables" },
  { key: "canAdvancedStats", label: "Stats avancées" },
  { key: "canExportCSV", label: "Export CSV" },
  { key: "canAdvancedInsights", label: "Insights IA avancés" },
  { key: "canPrioritySupport", label: "Support prioritaire" },
  { key: "canBetaFeatures", label: "Accès anticipé" },
];

export function SubscriptionManageView({
  subscription,
  entitlements,
  history,
}: {
  subscription: UserSubscription;
  entitlements: PlanEntitlements;
  history: SubscriptionEvent[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const plan = UBERLY_PLANS[subscription.planId];

  const statusLabel = useMemo(() => {
    if (subscription.cancelAtPeriodEnd) {
      return `Actif · se termine le ${formatDate(subscription.currentPeriodEnd)}`;
    }
    if (subscription.status === "trialing") return "Essai actif";
    if (subscription.status === "canceled") return "Annulé";
    if (subscription.status === "expired") return "Expiré";
    return "Actif";
  }, [subscription]);

  const run = (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    startTransition(async () => {
      try {
        await fn();
      } finally {
        setBusy(null);
      }
    });
  };

  return (
    <div className="app-page mx-auto max-w-2xl space-y-5 pb-12">
      <header className="app-page-header">
        <p className="app-page-eyebrow">Abonnement</p>
        <h1 className="app-page-title">Mon abonnement</h1>
        <p className="app-page-desc">
          Plan actuel, fonctionnalités et historique.
        </p>
      </header>

      <Card className="border-mg-accent/20">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xl font-semibold text-mg-foreground">
                <Crown className="size-5 text-mg-accent" />
                {plan.name}
              </p>
              <p className="mt-1 text-sm text-mg-muted">{statusLabel}</p>
              <p className="mt-2 text-xs text-mg-faint">
                Depuis le {formatDate(subscription.startedAt)}
                {subscription.currentPeriodEnd
                  ? ` · période jusqu’au ${formatDate(subscription.currentPeriodEnd)}`
                  : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-mg-foreground">
                {formatPlanPrice(plan.priceMonthly)}
              </p>
              <p className="text-xs text-mg-faint">/ mois</p>
            </div>
          </div>

          {subscription.paymentStatus === "simulated" && (
            <p className="rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] px-3 py-2 text-xs text-mg-muted">
              Paiement simulé (bêta) · provider{" "}
              {subscription.provider ?? "simulated"}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={margeoRoutes.premium} className="flex-1">
              <Button variant="secondary" className="w-full min-h-11">
                Changer de plan
              </Button>
            </Link>
            {entitlements.canExportCSV && (
              <a href="/api/uberly/export/csv" className="flex-1">
                <Button variant="outline" className="w-full min-h-11">
                  <Download className="size-4" />
                  Export CSV
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fonctionnalités incluses</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {ENTITLEMENT_ROWS.map((row) => {
            const on = Boolean(entitlements[row.key]);
            return (
              <div
                key={row.key}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm",
                  on
                    ? "border-mg-accent/25 bg-mg-accent-soft/30 text-mg-foreground"
                    : "border-mg-border text-mg-faint",
                )}
              >
                {on ? (
                  <Check className="size-4 shrink-0 text-mg-accent" />
                ) : (
                  <XCircle className="size-4 shrink-0 opacity-40" />
                )}
                {row.label}
              </div>
            );
          })}
          {!entitlements.canUnlimitedAnalysis && (
            <div className="flex items-center gap-2 rounded-xl border border-mg-border px-3 py-2.5 text-sm text-mg-muted sm:col-span-2">
              <Sparkles className="size-4 text-mg-accent" />
              {entitlements.dailyAnalysisLimit} analyses / jour · historique{" "}
              {entitlements.historyDays} jours
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Changer de formule</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {UBERLY_PLAN_ORDER.map((id) => {
            const p = UBERLY_PLANS[id];
            const current = id === subscription.planId;
            return (
              <div
                key={id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                  current
                    ? "border-mg-accent/40 bg-mg-accent-soft/20"
                    : "border-mg-border",
                )}
              >
                <div>
                  <p className="font-medium text-mg-foreground">{p.name}</p>
                  <p className="text-xs text-mg-muted">
                    {formatPlanPrice(p.priceMonthly)}/mois · {p.tagline}
                  </p>
                </div>
                {current ? (
                  <Button variant="secondary" size="sm" disabled>
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant={p.featured ? "primary" : "outline"}
                    disabled={pending}
                    loading={busy === `change-${id}`}
                    onClick={() =>
                      run(`change-${id}`, async () => {
                        const result = await changePlanAction({ planId: id });
                        if (!result.ok) {
                          toast.error(result.message);
                          return;
                        }
                        toast.success(`Plan ${p.name} activé`);
                        router.refresh();
                      })
                    }
                  >
                    Passer {p.name}
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {subscription.planId !== "discovery" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Annuler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-mg-muted">
              Tu peux garder l&apos;accès jusqu&apos;à la fin de la période, ou
              revenir immédiatement à Découverte.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="min-h-11"
                disabled={pending || subscription.cancelAtPeriodEnd}
                loading={busy === "cancel-end"}
                onClick={() =>
                  run("cancel-end", async () => {
                    const result = await cancelSubscriptionAction({
                      immediate: false,
                    });
                    if (!result.ok) {
                      toast.error(result.message);
                      return;
                    }
                    toast.success("Annulation planifiée en fin de période");
                    router.refresh();
                  })
                }
              >
                Annuler en fin de période
              </Button>
              <Button
                variant="danger"
                className="min-h-11"
                disabled={pending}
                loading={busy === "cancel-now"}
                onClick={() =>
                  run("cancel-now", async () => {
                    const result = await cancelSubscriptionAction({
                      immediate: true,
                    });
                    if (!result.ok) {
                      toast.error(result.message);
                      return;
                    }
                    toast.success("Retour au plan Découverte");
                    router.refresh();
                  })
                }
              >
                Annuler maintenant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Historique
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-mg-muted">Aucun événement pour l’instant.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((event) => (
                <li
                  key={event.id}
                  className="flex items-start justify-between gap-3 border-b border-mg-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-mg-foreground">
                      {EVENT_LABELS[event.eventType] ?? event.eventType}
                    </p>
                    <p className="text-xs text-mg-faint">
                      {event.fromPlan ?? "—"} → {event.toPlan ?? "—"}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs text-mg-faint">
                    {formatDate(event.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
