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
  const firstName = profile.name.split(" ")[0] || "livreur";
  const { savedEstimate, refusedCount, weekCount, verdictCounts } =
    computeMetrics(analyses);

  return (
    <div className="animate-mg-fade-up space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-mg-faint uppercase">
            Centre de pilotage
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-mg-foreground sm:text-3xl">
            Salut {firstName}
          </h1>
          <p className="mt-1 text-sm text-mg-muted">
            {isEmpty
              ? "Analyse ta première course pour activer ton tableau de bord."
              : `${weekCount} analyse${weekCount !== 1 ? "s" : ""} cette semaine`}
          </p>
        </div>
        <Link href={margeoRoutes.analyse} className="w-full shrink-0 sm:w-auto">
          <Button className="app-cta-primary w-full min-h-11 sm:w-auto">
            <ScanLine />
            {isEmpty ? "Première analyse" : "Analyser"}
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={ScanLine}
          title="Ton tableau de bord t'attend"
          description="Une capture suffit. Uberly calcule ton gain net et te dit quoi faire — en quelques secondes."
          action={
            <Link href={margeoRoutes.analyse}>
              <Button className="app-cta-primary min-h-11">
                <ScanLine />
                Analyser ma première course
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Hero KPI — objectif + gain du jour */}
          <Card className="overflow-hidden border-mg-accent/20 bg-gradient-to-br from-mg-card to-mg-accent-soft/10 p-5 sm:p-6">
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
            <StatCard label="Rentabilité" icon={Gauge} footer="score moyen">
              <AnimatedCounter value={stats.avgScore} suffix="/100" />
            </StatCard>
            <StatCard
              label="Courses analysées"
              icon={ScanLine}
              footer={`${stats.acceptedShare}% à accepter`}
            >
              <AnimatedCounter value={stats.analyzedCount} />
            </StatCard>
            <StatCard
              label="Courses évitées"
              icon={ShieldCheck}
              footer={
                savedEstimate > 0
                  ? `~${savedEstimate} € préservés`
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
                <CardTitle className="text-base">Semaine en cours</CardTitle>
                <p className="text-xs text-mg-faint">Gains nets par jour</p>
              </CardHeader>
              <CardContent>
                <WeeklyBars data={earnings} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition des verdicts</CardTitle>
                <p className="text-xs text-mg-faint">Toutes tes analyses</p>
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
                <CardTitle className="text-base">Évolution 14 jours</CardTitle>
                <p className="text-xs text-mg-faint">Gains nets cumulés</p>
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
              Tes analyses apparaîtront ici.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
