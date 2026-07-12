"use client";

import {
  Clock,
  Euro,
  Fuel,
  MapPin,
  PiggyBank,
  Route,
  Sparkles,
  Timer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnalysisConfidence } from "@/components/margeo/analyse/analysis-confidence";
import { ScoreBreakdown } from "@/components/margeo/score-breakdown";
import { PlatformBadge } from "@/components/margeo/platform-badge";
import { ProgressRing } from "@/components/margeo/progress-ring";
import { AnimatedCounter } from "@/components/margeo/animated-counter";
import { VerdictBadge } from "@/components/margeo/verdict-badge";
import { Card } from "@/components/margeo/ui/card";
import type { AnalysisMeta } from "@/lib/margeo/analyse-meta";
import { getScoreLabel } from "@/lib/margeo/analyse-meta";
import type { RideAnalysis } from "@/lib/margeo/types";
import { VERDICT_META } from "@/lib/margeo/types";

interface MetricProps {
  icon: LucideIcon;
  label: string;
  value: number;
  decimals?: number;
  suffix: string;
  highlight?: boolean;
}

function Metric({
  icon: Icon,
  label,
  value,
  decimals = 2,
  suffix,
  highlight,
}: MetricProps) {
  return (
    <Card
      className={
        highlight
          ? "border-mg-accent/30 bg-mg-accent-soft/30 p-4"
          : "p-4"
      }
    >
      <p className="flex items-center gap-1.5 text-xs font-medium text-mg-muted">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-2 text-xl font-bold tracking-tight text-mg-foreground">
        <AnimatedCounter
          value={value}
          decimals={decimals}
          suffix={suffix}
          duration={0.6}
        />
      </p>
    </Card>
  );
}

interface AnalysisResultProps {
  analysis: RideAnalysis;
  meta?: AnalysisMeta;
}

export function AnalysisResult({ analysis, meta }: AnalysisResultProps) {
  const verdictMeta = VERDICT_META[analysis.verdict];
  const scoreLabel = getScoreLabel(analysis.score, analysis.verdict);

  return (
    <div className="app-fade-in space-y-4">
      <Card
        className="relative overflow-hidden p-5 text-center sm:p-7"
        style={{
          borderColor: `color-mix(in srgb, ${verdictMeta.color} 35%, transparent)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(520px circle at 50% 0%, color-mix(in srgb, ${verdictMeta.color} 12%, transparent), transparent 70%)`,
          }}
          aria-hidden
        />
        <div className="relative">
          <VerdictBadge verdict={analysis.verdict} size="md" />
          <p
            className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: verdictMeta.color }}
          >
            {verdictMeta.label}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-mg-muted">
            {verdictMeta.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <PlatformBadge platform={analysis.offer.platform} />
            <span className="inline-flex items-center gap-1.5 text-xs text-mg-faint">
              <MapPin className="size-3" />
              {analysis.offer.pickup} → {analysis.offer.dropoff}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <ProgressRing
            value={analysis.score}
            size={112}
            color={verdictMeta.color}
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-mg-foreground">
                {analysis.score}
              </p>
              <p className="text-[10px] font-medium tracking-widest text-mg-faint uppercase">
                / 100
              </p>
            </div>
          </ProgressRing>
          <div className="text-center sm:text-left">
            <p className="text-lg font-semibold text-mg-foreground">
              {scoreLabel}
            </p>
            <p className="mt-1 text-sm text-mg-muted">
              Score de rentabilité basé sur ton profil
            </p>
            <p
              className="mt-3 text-xl font-bold tracking-tight"
              style={{ color: verdictMeta.color }}
            >
              <AnimatedCounter
                value={analysis.netGain}
                decimals={2}
                suffix=" € net"
                duration={0.7}
              />
              <span className="ml-2 text-sm font-semibold text-mg-muted">
                ·{" "}
                {analysis.hourlyRate.toLocaleString("fr-FR", {
                  maximumFractionDigits: 1,
                })}{" "}
                €/h
              </span>
            </p>
          </div>
        </div>
      </Card>

      {meta && <AnalysisConfidence meta={meta} />}

      <Card className="border-mg-accent/20 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-mg-accent">
          <Sparkles className="size-4" />
          Pourquoi cette recommandation ?
        </p>
        <p className="mt-3 text-base leading-relaxed text-mg-foreground">
          {analysis.explanation}
        </p>
        {analysis.insights.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-mg-border pt-4">
            {analysis.insights.map((insight) => (
              <li
                key={insight}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-mg-muted"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mg-accent/60" />
                {insight}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {analysis.scoreBreakdown.length > 0 && (
        <ScoreBreakdown factors={analysis.scoreBreakdown} />
      )}

      <div>
        <p className="mb-3 text-xs font-semibold tracking-wide text-mg-faint uppercase">
          Détails financiers
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric
            icon={Euro}
            label="Gain brut"
            value={analysis.grossGain}
            suffix=" €"
          />
          <Metric
            icon={Fuel}
            label="Coût estimé"
            value={analysis.estimatedCost}
            suffix=" €"
          />
          <Metric
            icon={PiggyBank}
            label="Gain net"
            value={analysis.netGain}
            suffix=" €"
            highlight
          />
          <Metric
            icon={Timer}
            label="Taux horaire"
            value={analysis.hourlyRate}
            decimals={1}
            suffix=" €/h"
          />
          <Metric
            icon={Clock}
            label="Temps estimé"
            value={analysis.offer.durationMin ?? 0}
            decimals={0}
            suffix=" min"
          />
          <Metric
            icon={Route}
            label="Distance"
            value={analysis.offer.distanceKm ?? 0}
            decimals={1}
            suffix=" km"
          />
        </div>
      </div>
    </div>
  );
}
