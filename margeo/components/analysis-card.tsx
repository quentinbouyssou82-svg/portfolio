"use client";

import { ArrowRight, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PlatformBadge } from "@/components/platform-badge";
import { VerdictBadge } from "@/components/verdict-badge";
import type { RideAnalysis } from "@/lib/types";
import { VERDICT_META } from "@/lib/types";
import {
  formatEur,
  formatKm,
  formatMin,
  formatRelativeDate,
} from "@/lib/utils";

/** Carte d'une analyse, utilisée dans le dashboard et l'historique. */
export function AnalysisCard({ analysis }: { analysis: RideAnalysis }) {
  const meta = VERDICT_META[analysis.verdict];

  return (
    <Link href={`/historique/${analysis.id}`} className="group block">
      <Card interactive className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          {/* Score */}
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl text-base font-bold"
            style={{ color: meta.color, backgroundColor: meta.softColor }}
          >
            {analysis.score}
          </div>

          {/* Infos course */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <PlatformBadge platform={analysis.offer.platform} />
              <span className="text-xs text-faint">
                {formatRelativeDate(analysis.analyzedAt)}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-foreground">
              <MapPin className="size-3.5 shrink-0 text-faint" />
              <span className="truncate">
                {analysis.offer.pickup} → {analysis.offer.dropoff}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-3 text-xs text-muted">
              <span className="font-semibold text-foreground">
                {formatEur(analysis.netGain)} net
              </span>
              <span>{formatKm(analysis.offer.distanceKm)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {formatMin(analysis.offer.durationMin)}
              </span>
            </p>
          </div>

          {/* Verdict + flèche */}
          <div className="flex shrink-0 items-center gap-3">
            <VerdictBadge verdict={analysis.verdict} className="hidden sm:inline-flex" />
            <ArrowRight className="size-4 text-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
