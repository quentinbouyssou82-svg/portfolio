"use client";

import { ScanLine } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnalysisCard } from "@/components/margeo/analysis-card";
import { Button } from "@/components/margeo/ui/button";
import { EmptyState } from "@/components/margeo/ui/empty-state";
import { VERDICT_META, type RideAnalysis, type Verdict } from "@/lib/margeo/types";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

type Filter = "all" | Verdict;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "accept", label: VERDICT_META.accept.label },
  { value: "check", label: VERDICT_META.check.label },
  { value: "refuse", label: VERDICT_META.refuse.label },
];

export function HistoriqueView({ analyses }: { analyses: RideAnalysis[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? analyses
        : analyses.filter((a) => a.verdict === filter),
    [analyses, filter],
  );

  return (
    <div className="animate-mg-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-mg-foreground">
            Historique
          </h1>
          <p className="mt-1 text-sm text-mg-muted">
            {analyses.length} analyse{analyses.length !== 1 ? "s" : ""} enregistrée
            {analyses.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <Link href={margeoRoutes.analyse}>
          <Button>
            <ScanLine />
            Analyser une course
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
              filter === f.value
                ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                : "border-mg-border text-mg-muted hover:border-mg-border-strong hover:text-mg-foreground",
            )}
          >
            {f.label}
            <span className="ml-1.5 text-mg-faint">
              {f.value === "all"
                ? analyses.length
                : analyses.filter((a) => a.verdict === f.value).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {analyses.length === 0 ? (
          <EmptyState
            icon={ScanLine}
            title="Aucune analyse enregistrée"
            description="Analyse ta première course pour voir ton historique et suivre tes décisions."
            action={
              <Link href={margeoRoutes.analyse}>
                <Button>
                  <ScanLine />
                  Analyser une course
                </Button>
              </Link>
            }
          />
        ) : (
          <>
            {filtered.map((analysis) => (
              <AnalysisCard key={analysis.id} analysis={analysis} />
            ))}
            {filtered.length === 0 && (
              <EmptyState
                icon={ScanLine}
                title="Aucune analyse dans cette catégorie"
                description="Essaie un autre filtre ou analyse une nouvelle course."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
