"use client";

import { CheckCircle2, Info } from "lucide-react";
import type { AnalysisMeta } from "@/lib/margeo/analyse-meta";
import { formatMissingFields } from "@/lib/margeo/analyse-meta";
import { Card } from "@/components/margeo/ui/card";
import { cn } from "@/lib/margeo/utils";

interface AnalysisConfidenceProps {
  meta?: AnalysisMeta;
}

export function AnalysisConfidence({ meta }: AnalysisConfidenceProps) {
  if (!meta?.confidence && !meta?.missingFields?.length) return null;

  const confidence = meta.confidence ?? 1;
  const pct = Math.round(confidence * 100);
  const isHigh = confidence >= 0.85 && meta.extractionQuality !== "partial";
  const isPartial =
    meta.extractionQuality === "partial" ||
    (meta.missingFields && meta.missingFields.length > 0) ||
    confidence < 0.75;

  const missingText =
    meta.missingFields && meta.missingFields.length > 0
      ? formatMissingFields(meta.missingFields)
      : null;

  return (
    <Card
      className={cn(
        "p-4",
        isHigh
          ? "border-mg-go/20 bg-mg-go-soft/20"
          : "border-mg-check/20 bg-mg-check-soft/15",
      )}
    >
      <div className="flex gap-3">
        {isHigh ? (
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mg-go" />
        ) : (
          <Info className="mt-0.5 size-4 shrink-0 text-mg-check" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-mg-foreground">
            {isHigh
              ? `Confiance lecture ~${pct} %`
              : isPartial
                ? "Données partiellement estimées"
                : `Confiance lecture ~${pct} %`}
          </p>
          {missingText && (
            <p className="mt-1 text-xs leading-relaxed text-mg-muted">
              {missingText} Estimation indicative avec les données disponibles.
            </p>
          )}
          {!missingText && !isHigh && (
            <p className="mt-1 text-xs text-mg-muted">
              Vérifie le gain et la distance — l&apos;IA peut se tromper.
            </p>
          )}
          {isHigh && !missingText && (
            <p className="mt-1 text-xs text-mg-muted">
              Montants indicatifs. Vérifie les chiffres clés avant d&apos;accepter.
            </p>
          )}
          {meta.warnings && meta.warnings.length > 0 && (
            <ul className="mt-2 space-y-1">
              {meta.warnings.slice(0, 2).map((w) => (
                <li key={w} className="text-xs text-mg-faint">
                  · {w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
