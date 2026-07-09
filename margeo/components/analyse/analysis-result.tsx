"use client";

import { motion } from "framer-motion";
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
import { PlatformBadge } from "@/components/platform-badge";
import { ProgressRing } from "@/components/progress-ring";
import { AnimatedCounter } from "@/components/animated-counter";
import { VerdictBadge } from "@/components/verdict-badge";
import { Card } from "@/components/ui/card";
import type { RideAnalysis } from "@/lib/types";
import { VERDICT_META } from "@/lib/types";

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
      interactive
      className={highlight ? "border-accent/30 bg-accent-soft/40 p-4" : "p-4"}
    >
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-2 text-xl font-bold tracking-tight text-foreground">
        <AnimatedCounter
          value={value}
          decimals={decimals}
          suffix={suffix}
          duration={0.9}
        />
      </p>
    </Card>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

/** Vue complète d'un résultat d'analyse (page Analyse + détail Historique). */
export function AnalysisResult({ analysis }: { analysis: RideAnalysis }) {
  const meta = VERDICT_META[analysis.verdict];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Verdict principal */}
      <motion.div variants={item}>
        <Card
          className="relative overflow-hidden p-6 sm:p-8"
          style={{ borderColor: `color-mix(in srgb, ${meta.color} 30%, transparent)` }}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(480px circle at 15% 0%, color-mix(in srgb, ${meta.color} 10%, transparent), transparent 65%)`,
            }}
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
            <ProgressRing value={analysis.score} size={140} color={meta.color}>
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground">
                  {analysis.score}
                </p>
                <p className="text-[10px] font-medium tracking-widest text-faint uppercase">
                  Score
                </p>
              </div>
            </ProgressRing>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2.5 sm:flex-row">
                <VerdictBadge verdict={analysis.verdict} size="md" />
                <PlatformBadge platform={analysis.offer.platform} />
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted sm:justify-start">
                <MapPin className="size-4 shrink-0 text-faint" />
                {analysis.offer.pickup} → {analysis.offer.dropoff}
              </p>
              <p
                className="mt-3 text-2xl font-bold tracking-tight"
                style={{ color: meta.color }}
              >
                <AnimatedCounter
                  value={analysis.netGain}
                  decimals={2}
                  suffix=" € net"
                  duration={1}
                />
                <span className="ml-2 text-base font-semibold text-muted">
                  · {analysis.hourlyRate.toLocaleString("fr-FR", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  €/h
                </span>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Grille de métriques */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
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
          value={analysis.offer.durationMin}
          decimals={0}
          suffix=" min"
        />
        <Metric
          icon={Route}
          label="Distance"
          value={analysis.offer.distanceKm}
          decimals={1}
          suffix=" km"
        />
      </motion.div>

      {/* Explication IA */}
      <motion.div variants={item}>
        <Card className="border-accent/20 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-accent">
            <Sparkles className="size-4" />
            Recommandation Margeo
          </p>
          <p className="mt-3 leading-relaxed text-foreground">
            {analysis.explanation}
          </p>
          {analysis.insights.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {analysis.insights.map((insight) => (
                <li
                  key={insight}
                  className="flex items-start gap-2.5 text-sm text-muted"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent/60" />
                  {insight}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
