"use client";

import { ScanLine } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnalysisCard } from "@/components/analysis-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { DEMO_ANALYSES } from "@/lib/data";
import { VERDICT_META, type Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | Verdict;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "accept", label: VERDICT_META.accept.label },
  { value: "check", label: VERDICT_META.check.label },
  { value: "refuse", label: VERDICT_META.refuse.label },
];

export default function HistoriquePage() {
  const loading = useFakeLoading(600);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? DEMO_ANALYSES
        : DEMO_ANALYSES.filter((a) => a.verdict === filter),
    [filter]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-80 rounded-full" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Historique
          </h1>
          <p className="mt-1 text-sm text-muted">
            {DEMO_ANALYSES.length} analyses sur les 7 derniers jours.
          </p>
        </div>
        <Link href="/analyse">
          <Button>
            <ScanLine />
            Analyser une course
          </Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
              filter === f.value
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:border-border-strong hover:text-foreground"
            )}
          >
            {f.label}
            <span className="ml-1.5 text-faint">
              {f.value === "all"
                ? DEMO_ANALYSES.length
                : DEMO_ANALYSES.filter((a) => a.verdict === f.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {filtered.map((analysis) => (
          <AnalysisCard key={analysis.id} analysis={analysis} />
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-card py-12 text-center text-sm text-muted">
            Aucune analyse dans cette catégorie.
          </p>
        )}
      </div>
    </div>
  );
}
