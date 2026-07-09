"use client";

import {
  Euro,
  Gauge,
  ScanLine,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AnalysisCard } from "@/components/margeo/analysis-card";
import { AnimatedCounter } from "@/components/margeo/animated-counter";
import { EarningsChart } from "@/components/margeo/earnings-chart";
import { ProgressRing } from "@/components/margeo/progress-ring";
import { StatCard } from "@/components/margeo/stat-card";
import { Button } from "@/components/margeo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/margeo/ui/card";
import { EmptyState } from "@/components/margeo/ui/empty-state";
import type { DashboardStats, EarningsPoint } from "@/lib/margeo/services/stats";
import type { RideAnalysis, UserProfile } from "@/lib/margeo/types";
import { margeoRoutes } from "@/lib/margeo/routes";

interface DashboardViewProps {
  profile: UserProfile;
  stats: DashboardStats;
  earnings: EarningsPoint[];
  recent: RideAnalysis[];
  analyses: RideAnalysis[];
}

function computeValueMetrics(analyses: RideAnalysis[]) {
  const refused = analyses.filter((a) => a.verdict === "refuse");
  const savedEstimate = refused.reduce(
    (sum, a) => sum + Math.max(0, -a.netGain),
    0,
  );
  const clearDecisions = analyses.filter(
    (a) => a.verdict === "accept" || a.verdict === "refuse",
  ).length;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekCount = analyses.filter(
    (a) => new Date(a.analyzedAt) >= weekAgo,
  ).length;

  return {
    savedEstimate: Math.round(savedEstimate * 100) / 100,
    refusedCount: refused.length,
    clearDecisions,
    weekCount,
  };
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
  const { savedEstimate, refusedCount, clearDecisions, weekCount } =
    computeValueMetrics(analyses);

  return (
    <div className="animate-mg-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-mg-foreground">
            Salut {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-mg-muted">
            {isEmpty
              ? "Analyse ta première course pour voir tes statistiques."
              : "Voilà l'impact d'Uberly sur tes décisions."}
          </p>
        </div>
        <Link href={margeoRoutes.analyse} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <ScanLine />
            {isEmpty ? "Analyser ma première course" : "Analyser une course"}
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={ScanLine}
          title="Aucune analyse pour l'instant"
          description="Dépose une capture de course et Uberly te dira en quelques secondes si elle vaut le coup — gain net, taux horaire et verdict."
          action={
            <Link href={margeoRoutes.analyse}>
              <Button>
                <ScanLine />
                Analyser ma première course
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <Card className="border-mg-accent/20 bg-mg-accent-soft/15 p-5">
            <p className="text-sm font-semibold text-mg-foreground">
              Ta progression cette semaine
            </p>
            <p className="mt-2 text-sm leading-relaxed text-mg-muted">
              Tu as analysé{" "}
              <span className="font-semibold text-mg-foreground">
                {weekCount} course{weekCount !== 1 ? "s" : ""}
              </span>{" "}
              cette semaine.
              {refusedCount > 0 && (
                <>
                  {" "}
                  Uberly t&apos;a aidé à éviter{" "}
                  <span className="font-semibold text-mg-foreground">
                    {refusedCount} course{refusedCount !== 1 ? "s" : ""}
                  </span>{" "}
                  peu rentable{refusedCount !== 1 ? "s" : ""}.
                </>
              )}
            </p>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Gain du jour"
              icon={Euro}
              delta={
                stats.todayDelta >= 0
                  ? `+${stats.todayDelta.toLocaleString("fr-FR")} €`
                  : `${stats.todayDelta.toLocaleString("fr-FR")} €`
              }
              footer="vs hier (analyses)"
            >
              <AnimatedCounter value={stats.todayNet} decimals={2} suffix=" €" />
            </StatCard>

            <StatCard
              label="Rentabilité moyenne"
              icon={Gauge}
              footer="sur tes analyses"
            >
              <AnimatedCounter value={stats.avgScore} suffix=" / 100" />
            </StatCard>

            <StatCard
              label="Courses analysées"
              icon={ScanLine}
              footer={`${stats.acceptedShare} % recommandées à l'acceptation`}
            >
              <AnimatedCounter value={stats.analyzedCount} />
            </StatCard>

            <StatCard
              label="Courses évitées"
              icon={ShieldCheck}
              footer={
                savedEstimate > 0
                  ? `~${savedEstimate.toLocaleString("fr-FR")} € préservés`
                  : "Décisions claires prises"
              }
            >
              <AnimatedCounter value={refusedCount} />
            </StatCard>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-mg-border bg-mg-card p-5 shadow-mg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-mg-border-strong hover:bg-mg-card-hover">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-mg-muted">
                  Objectif du jour
                </p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05]">
                  <Target className="size-4 text-mg-muted" />
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4">
                <ProgressRing value={goalProgress} size={72} strokeWidth={6}>
                  <span className="text-sm font-bold text-mg-foreground">
                    {goalProgress}%
                  </span>
                </ProgressRing>
                <div>
                  <p className="text-xl font-bold text-mg-foreground">
                    {stats.todayNet.toLocaleString("fr-FR")} €
                  </p>
                  <p className="text-xs text-mg-faint">
                    sur {profile.dailyTarget} € visés
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-mg-border bg-mg-card p-5 shadow-mg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-mg-border-strong hover:bg-mg-card-hover">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-mg-muted">
                  Meilleures décisions
                </p>
                <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05]">
                  <TrendingUp className="size-4 text-mg-muted" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-mg-foreground">
                <AnimatedCounter value={clearDecisions} />
              </p>
              <p className="mt-1 text-xs text-mg-faint">
                verdicts clairs (accepter ou refuser) sur{" "}
                {stats.analyzedCount} analyse
                {stats.analyzedCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Évolution des gains nets</CardTitle>
                <p className="mt-1 text-xs text-mg-faint">14 derniers jours</p>
              </div>
            </CardHeader>
            <CardContent>
              <EarningsChart data={earnings} />
            </CardContent>
          </Card>
        </>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-mg-foreground">
            Dernières analyses
          </h2>
          {!isEmpty && (
            <Link
              href={margeoRoutes.historique}
              className="text-sm text-mg-muted transition-colors hover:text-mg-accent"
            >
              Tout voir →
            </Link>
          )}
        </div>
        <div className="space-y-3">
          {recent.length > 0 ? (
            recent.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))
          ) : (
            <p className="text-center text-sm text-mg-faint">
              Tes analyses apparaîtront ici.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
