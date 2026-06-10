"use client";

import { Bell, Mail, TrendingUp } from "lucide-react";
import { McnPageHeader } from "@/components/mon-cerveau-numerique/mcn-page-header";
import { McnPageSkeleton } from "@/components/mon-cerveau-numerique/mcn-page-skeleton";
import { McnBadge } from "@/components/mon-cerveau-numerique/ui/badge";
import {
  McnCard,
  McnCardContent,
  McnCardHeader,
  McnCardTitle,
} from "@/components/mon-cerveau-numerique/ui/card";
import { McnEmptyState } from "@/components/mon-cerveau-numerique/ui/empty-state";
import { useMcnStore } from "@/hooks/use-mcn-store";

export function McnRecapPanel() {
  const { data, ready } = useMcnStore();

  if (!ready) {
    return <McnPageSkeleton variant="dashboard" />;
  }

  const name = data.profile.display_name ?? "toi";
  const topTasks = data.tasks.filter((t) => !t.done).slice(0, 5);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <McnPageHeader
        eyebrow="Chaque matin à 7h"
        title="Récap matinal"
        description={`Bonjour ${name}, voici ce qui compte aujourd'hui.`}
      />

      <McnCard>
        <McnCardHeader className="flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-amber-400" />
            <McnCardTitle>Priorités du jour</McnCardTitle>
          </div>
          <McnBadge variant="secondary">{topTasks.length} tâche{topTasks.length > 1 ? "s" : ""}</McnBadge>
        </McnCardHeader>
        <McnCardContent>
          {topTasks.length === 0 ? (
            <McnEmptyState
              icon={Bell}
              title="Rien d'urgent"
              description="Aucune tâche en attente. Belle journée !"
              className="border-none bg-transparent py-6"
            />
          ) : (
            <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--mcn-fg-muted)]">
              {topTasks.map((task) => (
                <li key={task.id} className="text-[var(--mcn-fg)]">
                  {task.title}
                </li>
              ))}
            </ol>
          )}
        </McnCardContent>
      </McnCard>

      <McnCard>
        <McnCardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-[var(--mcn-accent)]" />
            <McnCardTitle>Mails</McnCardTitle>
          </div>
        </McnCardHeader>
        <McnCardContent>
          <p className="text-sm text-[var(--mcn-fg-muted)]">
            Mode démo — intégration Gmail non connectée. 0 mail urgent détecté.
          </p>
        </McnCardContent>
      </McnCard>

      <McnCard>
        <McnCardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-orange-400" />
            <McnCardTitle>Économies potentielles</McnCardTitle>
          </div>
        </McnCardHeader>
        <McnCardContent>
          <p className="text-sm text-[var(--mcn-fg-muted)]">
            Mode démo — la veille contrats sera activée avec le backend complet.
          </p>
        </McnCardContent>
      </McnCard>
    </div>
  );
}
