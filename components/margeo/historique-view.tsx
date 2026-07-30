"use client";

import { Search, ScanLine, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AnalysisCard } from "@/components/margeo/analysis-card";
import { Button } from "@/components/margeo/ui/button";
import { EmptyState } from "@/components/margeo/ui/empty-state";
import { Input } from "@/components/margeo/ui/input";
import { groupAnalysesByDate } from "@/lib/margeo/date-groups";
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

function matchesSearch(analysis: RideAnalysis, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return true;
  const haystack = [
    analysis.offer.platform,
    analysis.offer.pickup,
    analysis.offer.dropoff,
    String(analysis.score),
    VERDICT_META[analysis.verdict].label,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

export function HistoriqueView({ analyses }: { analyses: RideAnalysis[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = analyses;
    if (filter !== "all") {
      list = list.filter((a) => a.verdict === filter);
    }
    if (search.trim()) {
      list = list.filter((a) => matchesSearch(a, search));
    }
    return list;
  }, [analyses, filter, search]);

  const grouped = useMemo(() => groupAnalysesByDate(filtered), [filtered]);
  const hasActiveFilters = filter !== "all" || search.trim().length > 0;

  return (
    <div className="app-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header className="app-page-header">
          <p className="app-page-eyebrow">Historique</p>
          <h1 className="app-page-title">Tes courses</h1>
          <p className="app-page-desc">
            {analyses.length} course{analyses.length !== 1 ? "s" : ""} analysée
            {analyses.length !== 1 ? "s" : ""}
          </p>
        </header>
        <Link href={margeoRoutes.analyse} className="w-full shrink-0 sm:w-auto">
          <Button className="w-full sm:w-auto">
            <ScanLine />
            Analyser
          </Button>
        </Link>
      </div>

      {analyses.length > 0 && (
        <>
          <div className="relative">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-mg-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Plateforme, lieu, score…"
              className="min-h-11 pl-10"
              aria-label="Rechercher dans l'historique"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-mg-faint transition-colors hover:text-mg-foreground"
                aria-label="Effacer la recherche"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div
            className="mg-filter-row mg-scroll-x flex gap-1.5 overflow-x-auto pb-0.5"
            role="tablist"
            aria-label="Filtrer par verdict"
          >
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "mg-filter-chip",
                  filter === f.value && "mg-filter-chip-active",
                )}
              >
                {f.label}
                <span className="mg-filter-chip-count">
                  {f.value === "all"
                    ? analyses.length
                    : analyses.filter((a) => a.verdict === f.value).length}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {analyses.length === 0 ? (
        <EmptyState
          icon={ScanLine}
          title="Aucune analyse pour l’instant"
          description="Chaque course analysée apparaît ici avec verdict, score et gain net."
          action={
            <Link href={margeoRoutes.analyse}>
              <Button size="lg">
                <ScanLine />
                Analyser une course
              </Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Aucun résultat"
          description="Essaie un autre mot-clé ou réinitialise les filtres."
          action={
            hasActiveFilters ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
              >
                Réinitialiser
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-7">
          {grouped.map((group) => (
            <section key={group.key}>
              <h2 className="app-date-group">
                {group.label}
                <span className="app-date-group-count">{group.items.length}</span>
              </h2>
              <div className="space-y-2.5">
                {group.items.map((analysis) => (
                  <AnalysisCard key={analysis.id} analysis={analysis} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
