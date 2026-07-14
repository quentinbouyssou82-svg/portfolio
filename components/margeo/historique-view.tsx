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

  return (
    <div className="animate-mg-fade-up space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-mg-faint uppercase">
            Historique
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-mg-foreground sm:text-3xl">
            Historique
          </h1>
          <p className="mt-1 text-sm text-mg-muted">
            {analyses.length} course{analyses.length !== 1 ? "s" : ""}{" "}
            analysée{analyses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href={margeoRoutes.analyse} className="w-full sm:w-auto">
          <Button className="app-cta-primary w-full min-h-11 sm:w-auto">
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
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-mg-faint hover:text-mg-foreground"
                aria-label="Effacer la recherche"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="mg-scroll-x flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full border px-3.5 py-2.5 text-xs font-medium transition-colors min-h-11",
                  filter === f.value
                    ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                    : "border-mg-border text-mg-muted hover:border-mg-border-strong",
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
        </>
      )}

      {analyses.length === 0 ? (
        <EmptyState
          icon={ScanLine}
          title="Aucune analyse"
          description="Chaque course analysée apparaît ici avec verdict, score et gain net."
          action={
            <Link href={margeoRoutes.analyse}>
              <Button className="app-cta-primary min-h-11">
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
          description="Autre mot-clé ou filtre."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.key}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-mg-muted">
                {group.label}
                <span className="rounded-full bg-mg-border px-2 py-0.5 text-[10px] font-medium text-mg-faint">
                  {group.items.length}
                </span>
              </h2>
              <div className="space-y-3">
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
