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
    <Link href={margeoRoutes.historiqueDetail(analysis.id)} className="group block">
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
              <span className="text-xs text-mg-faint">
                {formatRelativeDate(analysis.analyzedAt)}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-mg-foreground">
              <MapPin className="size-3.5 shrink-0 text-mg-faint" />
              <span className="truncate">
                {analysis.offer.pickup} → {analysis.offer.dropoff}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-3 text-xs text-mg-muted">
              <span className="font-semibold text-mg-foreground">
                {formatEur(analysis.netGain)} net
              </span>
              <span>{formatKm(analysis.offer.distanceKm ?? 0)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {formatMin(analysis.offer.durationMin ?? 0)}
              </span>
            </p>
          </div>

          {/* Verdict + flèche */}
          <div className="flex shrink-0 items-center gap-3">
            <VerdictBadge verdict={analysis.verdict} className="hidden sm:inline-flex" />
            <ArrowRight className="size-4 text-mg-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-mg-foreground" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
