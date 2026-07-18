"use client";

import {
  ArrowRight,
  Euro,
  Gauge,
  ScanLine,
  ShieldCheck,
  Target,
} from "lucide-react";
import Link from "next/link";
import { AnalysisCard } from "@/components/margeo/analysis-card";
import { AnimatedCounter } from "@/components/margeo/animated-counter";
import { EarningsChart } from "@/components/margeo/earnings-chart";
import { ProgressRing } from "@/components/margeo/progress-ring";
import { StatCard } from "@/components/margeo/stat-card";
import { WeeklyBars } from "@/components/margeo/weekly-bars";
import { Button } from "@/components/margeo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/margeo/ui/card";
import { EmptyState } from "@/components/margeo/ui/empty-state";
import type { DashboardStats, EarningsPoint } from "@/lib/margeo/services/stats";
import type { RideAnalysis, UserProfile, Verdict } from "@/lib/margeo/types";
import { VERDICT_META } from "@/lib/margeo/types";
import { margeoRoutes } from "@/lib/margeo/routes";

interface DashboardViewProps {
  profile: UserProfile;
  stats: DashboardStats;
  earnings: EarningsPoint[];
  recent: RideAnalysis[];
  analyses: RideAnalysis[];
}

function computeMetrics(analyses: RideAnalysis[]) {
  const refused = analyses.filter((a) => a.verdict === "refuse");
  const savedEstimate = refused.reduce(
    (sum, a) => sum + Math.max(0, -a.netGain),
    0,
  );
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekCount = analyses.filter(
    (a) => new Date(a.analyzedAt) >= weekAgo,
  ).length;

  const verdictCounts: Record<Verdict, number> = {
    accept: 0,
    check: 0,
    refuse: 0,
  };
  for (const a of analyses) verdictCounts[a.verdict]++;

  return {
    savedEstimate: Math.round(savedEstimate * 100) / 100,
    refusedCount: refused.length,
    weekCount,
    verdictCounts,
  };
}

function VerdictPill({
  verdict,
  count,
  total,
}: {
  verdict: Verdict;
  count: number;
  total: number;
}) {
  const meta = VERDICT_META[verdict];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div
      className="flex items-center justify-between rounded-xl border border-mg-border bg-mg-surface/50 px-3 py-2.5"
      style={{ borderColor: `color-mix(in srgb, ${meta.color} 20%, transparent)` }}
    >
      <span className="flex items-center gap-2 text-xs font-medium text-mg-foreground">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        {meta.label}
      </span>
      <span className="text-xs font-semibold text-mg-muted">
        {count}{" "}
        <span className="text-mg-faint">({pct}%)</span>
      </span>
    </div>
  );
}

export function DashboardView({
  profile,
  stats,
  earnings,
  recent,
  analyses,
}: DashboardViewProps) {
  const isEmpty = stats.analyzedCount === 0;
  const goalProgress = Math.min(
    100,
    Math.round((stats.todayNet / profile.dailyTarget) * 100),
  );
  const firstName = profile.firstName || profile.name.split(" ")[0] || "livreur";
  const { savedEstimate, refusedCount, weekCount, verdictCounts } =
    computeMetrics(analyses);

  return (
    <div className="app-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="app-page-header">
          <p className="app-page-eyebrow">Tableau de bord</p>
          <h1 className="app-page-title">Salut {firstName}</h1>
          <p className="app-page-desc">
            {isEmpty
              ? "Une capture suffit pour démarrer."
              : `${weekCount} analyse${weekCount !== 1 ? "s" : ""} cette semaine`}
          </p>
        </header>
        <Link href={margeoRoutes.analyse} className="w-full shrink-0 sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">
            <ScanLine />
            {isEmpty ? "Première analyse" : "Analyser"}
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={ScanLine}
          title="Prêt à analyser"
          description="Dépose une capture. Verdict et gain net en 8 secondes."
          action={
            <Link href={margeoRoutes.analyse}>
              <Button size="lg">
                <ScanLine />
                Analyser ma première course
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Hero KPI — objectif + gain du jour */}
          <Card className="app-glass-surface overflow-hidden border-mg-accent/20 p-5 sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <ProgressRing
                  value={goalProgress}
                  size={88}
                  strokeWidth={7}
                  color="var(--color-mg-go)"
                >
                  <span className="text-lg font-bold text-mg-foreground">
                    {goalProgress}%
                  </span>
                </ProgressRing>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-mg-muted">
                    <Target className="size-3.5" />
                    Objectif du jour
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-mg-foreground">
                    <AnimatedCounter
                      value={stats.todayNet}
                      decimals={2}
                      suffix=" €"
                    />
                  </p>
                  <p className="mt-0.5 text-xs text-mg-faint">
                    sur {profile.dailyTarget} € visés · objectif{" "}
                    {profile.targetHourly} €/h
                    {profile.minBenefit != null && (
                      <>
                        {" "}
                        · min. {profile.minBenefit} €/course · max.{" "}
                        {profile.maxDistanceKm ?? 8} km
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { label: "Score moy.", value: stats.avgScore, suffix: "" },
                  {
                    label: "Analyses",
                    value: stats.analyzedCount,
                    suffix: "",
                  },
                  {
                    label: "Évitées",
                    value: refusedCount,
                    suffix: "",
                  },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-xl border border-mg-border bg-mg-background/50 px-3 py-2.5 text-center"
                  >
                    <p className="text-lg font-bold text-mg-foreground">
                      {kpi.value}
                      {kpi.suffix}
                    </p>
                    <p className="mt-0.5 text-[10px] text-mg-faint">
                      {kpi.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Stats rapides */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Gain du jour"
              icon={Euro}
              delta={
                stats.todayDelta >= 0
                  ? `+${stats.todayDelta.toLocaleString("fr-FR")} €`
                  : `${stats.todayDelta.toLocaleString("fr-FR")} €`
              }
              deltaPositive={stats.todayDelta >= 0}
              footer="vs hier"
            >
              <AnimatedCounter value={stats.todayNet} decimals={2} suffix=" €" />
            </StatCard>
            <StatCard label="Score moyen" icon={Gauge} footer="rentabilité">
              <AnimatedCounter value={stats.avgScore} suffix="/100" />
            </StatCard>
            <StatCard
              label="Analysées"
              icon={ScanLine}
              footer={`${stats.acceptedShare}% à accepter`}
            >
              <AnimatedCounter value={stats.analyzedCount} />
            </StatCard>
            <StatCard
              label="Évitées"
              icon={ShieldCheck}
              footer={
                savedEstimate > 0
                  ? `~${savedEstimate} € économisés`
                  : "grâce aux refus"
              }
            >
              <AnimatedCounter value={refusedCount} />
            </StatCard>
          </div>

          {/* Graphiques */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cette semaine</CardTitle>
                <p className="text-xs text-mg-faint">Gain net / jour</p>
              </CardHeader>
              <CardContent>
                <WeeklyBars data={earnings} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tes verdicts</CardTitle>
                <p className="text-xs text-mg-faint">Toutes les analyses</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {(["accept", "check", "refuse"] as Verdict[]).map((v) => (
                  <VerdictPill
                    key={v}
                    verdict={v}
                    count={verdictCounts[v]}
                    total={stats.analyzedCount}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">14 derniers jours</CardTitle>
                <p className="text-xs text-mg-faint">Gain net cumulé</p>
              </div>
            </CardHeader>
            <CardContent>
              <EarningsChart data={earnings} />
            </CardContent>
          </Card>
        </>
      )}

      {/* Historique récent */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-mg-foreground">
            Dernières analyses
          </h2>
          {!isEmpty && (
            <Link
              href={margeoRoutes.historique}
              className="flex items-center gap-1 text-sm text-mg-muted transition-colors hover:text-mg-accent"
            >
              Tout voir
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
        <div className="space-y-3">
          {recent.length > 0 ? (
            recent.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))
          ) : (
            <p className="py-6 text-center text-sm text-mg-faint">
              Tes analyses s&apos;afficheront ici.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
