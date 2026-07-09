"use client";

import {
  Euro,
  Gauge,
  ScanLine,
  Target,
} from "lucide-react";
import Link from "next/link";
import { AnalysisCard } from "@/components/analysis-card";
import { AnimatedCounter } from "@/components/animated-counter";
import { EarningsChart } from "@/components/earnings-chart";
import { ProgressRing } from "@/components/progress-ring";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import {
  DEMO_ANALYSES,
  DEMO_PROFILE,
  EARNINGS_SERIES,
  getDashboardStats,
} from "@/lib/data";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const loading = useFakeLoading(750);
  const stats = getDashboardStats();
  const recent = DEMO_ANALYSES.slice(0, 4);
  const goalProgress = Math.round(
    (stats.todayNet / DEMO_PROFILE.dailyTarget) * 100
  );

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="animate-fade-up space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Salut {DEMO_PROFILE.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            Voilà où tu en es aujourd&apos;hui. Continue comme ça.
          </p>
        </div>
        <Link href="/analyse">
          <Button>
            <ScanLine />
            Analyser une course
          </Button>
        </Link>
      </div>

      {/* Cartes stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Gain du jour"
          icon={Euro}
          delta={`+${stats.todayDelta.toLocaleString("fr-FR")} €`}
          footer="vs hier"
        >
          <AnimatedCounter value={stats.todayNet} decimals={2} suffix=" €" />
        </StatCard>

        <StatCard
          label="Rentabilité moyenne"
          icon={Gauge}
          delta="+4 pts"
          footer="sur 7 jours"
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

        {/* Objectif avec progress ring */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:bg-card-hover">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Objectif du jour</p>
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.05]">
              <Target className="size-4 text-muted" />
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4">
            <ProgressRing value={goalProgress} size={72} strokeWidth={6}>
              <span className="text-sm font-bold text-foreground">
                {goalProgress}%
              </span>
            </ProgressRing>
            <div>
              <p className="text-xl font-bold text-foreground">
                {stats.todayNet.toLocaleString("fr-FR")} €
              </p>
              <p className="text-xs text-faint">
                sur {DEMO_PROFILE.dailyTarget} € visés
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Évolution des gains nets</CardTitle>
            <p className="mt-1 text-xs text-faint">14 derniers jours</p>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            +18 % ce mois
          </span>
        </CardHeader>
        <CardContent>
          <EarningsChart data={EARNINGS_SERIES} />
        </CardContent>
      </Card>

      {/* Dernières analyses */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Dernières analyses</h2>
          <Link
            href="/historique"
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            Tout voir →
          </Link>
        </div>
        <div className="space-y-3">
          {recent.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      </section>
    </div>
  );
}
