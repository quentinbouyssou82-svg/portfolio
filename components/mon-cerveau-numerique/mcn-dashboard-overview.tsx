"use client";

import Link from "next/link";
import { ArrowUpRight, Bell, CircleCheckBig, FileText } from "lucide-react";
import { McnPageSkeleton } from "@/components/mon-cerveau-numerique/mcn-page-skeleton";
import { McnTasksPanel } from "@/components/mon-cerveau-numerique/mcn-tasks-panel";
import { McnBadge } from "@/components/mon-cerveau-numerique/ui/badge";
import {
  McnCard,
  McnCardContent,
  McnCardDescription,
  McnCardHeader,
  McnCardTitle,
} from "@/components/mon-cerveau-numerique/ui/card";
import { McnEmptyState } from "@/components/mon-cerveau-numerique/ui/empty-state";
import { useMcnStore } from "@/hooks/use-mcn-store";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";

export function McnDashboardOverview() {
  const { data, ready } = useMcnStore();

  if (!ready) {
    return <McnPageSkeleton variant="dashboard" />;
  }

  const greeting = data.profile.display_name ?? "toi";
  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const pendingTasks = data.tasks.filter((t) => !t.done).slice(0, 5);
  const recentDocs = data.documents.slice(0, 3);

  const stats = [
    { label: "Documents", value: data.stats.totalDocuments, icon: FileText },
    { label: "En cours", value: data.stats.pendingTasks, icon: CircleCheckBig },
    { label: "Terminées", value: data.stats.completedTasks, icon: CircleCheckBig },
    { label: "Catégories", value: data.stats.categories, icon: FileText },
  ] as const;

  return (
    <div className="space-y-8 p-4 md:p-8">
      <header className="space-y-1">
        <p className="text-xs font-medium capitalize tracking-wide text-[var(--mcn-fg-subtle)]">
          {todayLabel}
        </p>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Bonjour {greeting} 👋
        </h1>
        <p className="text-sm text-[var(--mcn-fg-muted)]">Voici ton récap du jour.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <McnCard
              key={stat.label}
              className="transition-colors hover:border-[var(--mcn-border-strong)] hover:bg-[var(--mcn-surface-hover)]"
            >
              <McnCardContent className="p-4">
                <Icon className="mb-2 size-4 text-[var(--mcn-accent)]" />
                <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-[var(--mcn-fg-muted)]">{stat.label}</p>
              </McnCardContent>
            </McnCard>
          );
        })}
      </div>

      <McnCard className="border-amber-500/15 bg-amber-500/[0.03]">
        <McnCardHeader className="flex-row items-center justify-between space-y-0 pb-0">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-amber-400" />
            <McnCardTitle>Récap matinal 7h</McnCardTitle>
          </div>
          <McnBadge variant="warning">Démo</McnBadge>
        </McnCardHeader>
        <McnCardContent>
          <ul className="space-y-1.5 text-sm text-[var(--mcn-fg-muted)]">
            <li>
              · {data.stats.pendingTasks} tâche{data.stats.pendingTasks > 1 ? "s" : ""} à traiter
              aujourd&apos;hui
            </li>
            <li>
              · {data.stats.totalDocuments} document{data.stats.totalDocuments > 1 ? "s" : ""}{" "}
              classé{data.stats.totalDocuments > 1 ? "s" : ""}
            </li>
            <li>· Aucune alerte mail urgente (mode démo)</li>
          </ul>
          <Link
            href={MCN_PATHS.recap}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--mcn-accent)] transition-colors hover:text-[var(--mcn-accent-hover)]"
          >
            Voir le récap complet
            <ArrowUpRight className="size-3.5" />
          </Link>
        </McnCardContent>
      </McnCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Tâches du jour</h2>
            <Link
              href={MCN_PATHS.todos}
              className="text-xs text-[var(--mcn-fg-muted)] transition-colors hover:text-[var(--mcn-accent)]"
            >
              Tout voir →
            </Link>
          </div>
          <McnTasksPanel tasks={pendingTasks} showAdd={false} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Documents récents</h2>
            <Link
              href={MCN_PATHS.documents}
              className="text-xs text-[var(--mcn-fg-muted)] transition-colors hover:text-[var(--mcn-accent)]"
            >
              Tout voir →
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <McnEmptyState
              icon={FileText}
              title="Aucun document récent"
              description="Tes derniers documents classés apparaîtront ici."
            />
          ) : (
            <ul className="space-y-2">
              {recentDocs.map((doc) => (
                <li key={doc.id}>
                  <McnCard className="transition-colors hover:border-[var(--mcn-border-strong)]">
                    <McnCardContent className="flex items-center gap-3 p-3">
                      <FileText className="size-4 shrink-0 text-[var(--mcn-accent)]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <McnCardDescription>{doc.category}</McnCardDescription>
                      </div>
                    </McnCardContent>
                  </McnCard>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
