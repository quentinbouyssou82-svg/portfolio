"use client";

import { useState } from "react";
import { CheckSquare, Plus } from "lucide-react";
import { cn } from "../../../_lib/cn";
import { TASK_FILTERS } from "../../../_lib/dashboard-data";
import { EmptyState, ImportGmailBanner, ViewContainer } from "../shared";
import { TaskModal } from "../task-modal";

export function TasksView() {
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ViewContainer wide>
      <div className="mb-5">
        <ImportGmailBanner />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TASK_FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? f.id === "all"
                    ? "text-[var(--cn-primary)]"
                    : "border border-[var(--cn-border)] bg-white/[0.08] text-[var(--cn-fg)]"
                  : "border border-[var(--cn-border)] bg-[var(--cn-surface)] text-[var(--cn-muted)] hover:text-[var(--cn-fg)]",
              )}
            >
              {f.emoji && <span>{f.emoji}</span>}
              {f.label}
            </button>
          );
        })}
        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-[image:var(--cn-grad-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5"
        >
          <Plus className="size-4" />
          Ajouter tâche
        </button>
      </div>

      <EmptyState icon={CheckSquare} description="Aucune tâche, tout est à jour !" />

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </ViewContainer>
  );
}
