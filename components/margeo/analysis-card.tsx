"use client";

import { ArrowRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/margeo/ui/card";
import { PlatformBadge } from "@/components/margeo/platform-badge";
import { VerdictBadge } from "@/components/margeo/verdict-badge";
import type { RideAnalysis } from "@/lib/margeo/types";
import { VERDICT_META } from "@/lib/margeo/types";
import { margeoRoutes } from "@/lib/margeo/routes";
import {
  formatEur,
  formatKm,
  formatMin,
  formatRelativeDate,
} from "@/lib/margeo/utils";

/** Carte d'une analyse, utilisée dans le dashboard et l'historique. */
export function AnalysisCard({ analysis }: { analysis: RideAnalysis }) {
  const meta = VERDICT_META[analysis.verdict];

  return (
    <Link
      href={margeoRoutes.historiqueDetail(analysis.id)}
      className="group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40"
      aria-label={`Analyse ${analysis.offer.pickup} vers ${analysis.offer.dropoff}, score ${analysis.score}, ${meta.label}`}
    >
      <Card interactive className="analysis-list-card relative overflow-hidden p-4 sm:p-5">
        <span
          className="analysis-list-card-accent"
          style={{ backgroundColor: meta.color }}
          aria-hidden
        />
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[0.9375rem] font-bold tabular-nums sm:size-12 sm:text-base"
            style={{ color: meta.color, backgroundColor: meta.softColor }}
          >
            {analysis.score}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <PlatformBadge platform={analysis.offer.platform} />
              <span className="text-[11px] text-mg-faint tabular-nums">
                {formatRelativeDate(analysis.analyzedAt)}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-mg-foreground">
              <MapPin className="size-3.5 shrink-0 text-mg-faint" />
              <span className="truncate">
                {analysis.offer.pickup} → {analysis.offer.dropoff}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-2.5 text-xs text-mg-muted">
              <span className="font-semibold tabular-nums text-mg-foreground">
                {formatEur(analysis.netGain)} net
              </span>
              <span className="text-mg-faint" aria-hidden>
                ·
              </span>
              <span className="tabular-nums">
                {formatKm(analysis.offer.distanceKm ?? 0)}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="size-3" />
                {formatMin(analysis.offer.durationMin ?? 0)}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
            <VerdictBadge verdict={analysis.verdict} />
            <ArrowRight className="size-4 text-mg-faint transition-transform duration-200 [@media(hover:hover)]:group-hover:translate-x-0.5 [@media(hover:hover)]:group-hover:text-mg-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
