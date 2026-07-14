"use client";

import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/margeo/ui/card";
import type { ScoreFactor } from "@/lib/margeo/types";

export function ScoreBreakdown({ factors }: { factors: ScoreFactor[] }) {
  if (!factors.length) return null;

  const positives = factors.filter((f) => f.impact > 0);
  const negatives = factors.filter((f) => f.impact < 0);

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-sm font-semibold text-mg-foreground">
        Pourquoi ce score
      </p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        {positives.length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-mg-go uppercase">
              <Plus className="size-3" />
              En plus
            </p>
            <ul className="space-y-2.5">
              {positives.map((factor) => (
                <FactorRow key={factor.label} factor={factor} type="positive" />
              ))}
            </ul>
          </div>
        )}

        {negatives.length > 0 && (
          <div>
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-mg-stop uppercase">
              <Minus className="size-3" />
              En moins
            </p>
            <ul className="space-y-2.5">
              {negatives.map((factor) => (
                <FactorRow key={factor.label} factor={factor} type="negative" />
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

function FactorRow({
  factor,
  type,
}: {
  factor: ScoreFactor;
  type: "positive" | "negative";
}) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span
        className={
          type === "positive"
            ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-mg-go"
            : "mt-1.5 size-1.5 shrink-0 rounded-full bg-mg-stop"
        }
      />
      <div className="min-w-0">
        <p className="font-medium text-mg-foreground">{factor.label}</p>
        <p className="mt-0.5 text-xs text-mg-muted">{factor.detail}</p>
      </div>
    </li>
  );
}
