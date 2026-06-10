"use client";

import { Check, CircleCheckBig, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { McnPageSkeleton } from "@/components/mon-cerveau-numerique/mcn-page-skeleton";
import { McnButton } from "@/components/mon-cerveau-numerique/ui/button";
import { McnCard } from "@/components/mon-cerveau-numerique/ui/card";
import { McnEmptyState } from "@/components/mon-cerveau-numerique/ui/empty-state";
import { McnInput } from "@/components/mon-cerveau-numerique/ui/input";
import { useMcnStore } from "@/hooks/use-mcn-store";
import type { McnTask } from "@/lib/mon-cerveau-numerique/types";
import { cn } from "@/lib/utils";

type McnTasksPanelProps = {
  tasks?: McnTask[];
  showAdd?: boolean;
};

const priorityLabels = {
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
} as const;

export function McnTasksPanel({ tasks: tasksProp, showAdd = true }: McnTasksPanelProps) {
  const { data, ready, addTask, toggleTask, deleteTask } = useMcnStore();
  const tasks = tasksProp ?? data.tasks;
  const [newTitle, setNewTitle] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle);
    setNewTitle("");
  }

  if (!ready) {
    return <McnPageSkeleton variant="list" />;
  }

  return (
    <div className="space-y-3">
      {showAdd ? (
        <form onSubmit={handleAdd} className="flex gap-2">
          <McnInput
            className="flex-1"
            placeholder="Nouvelle tâche…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <McnButton type="submit" size="icon" disabled={!newTitle.trim()} aria-label="Ajouter">
            <Plus className="size-4" />
          </McnButton>
        </form>
      ) : null}

      {tasks.length === 0 ? (
        <McnEmptyState
          icon={CircleCheckBig}
          title="Aucune tâche"
          description="Ajoute ta première tâche pour commencer à organiser ta journée."
        />
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <McnCard className="transition-colors hover:border-[var(--mcn-border-strong)] hover:bg-[var(--mcn-surface-hover)]">
                <div className="flex items-center gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id, !task.done)}
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
                      task.done
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                        : "border-[var(--mcn-border)] hover:border-[var(--mcn-border-strong)]",
                    )}
                    aria-label={task.done ? "Marquer non terminée" : "Marquer terminée"}
                  >
                    {task.done ? <Check className="size-3" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm",
                        task.done && "text-[var(--mcn-fg-muted)] line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    <p className={cn("text-[11px]", `mcn-priority-${task.priority}`)}>
                      {priorityLabels[task.priority]}
                    </p>
                  </div>
                  {showAdd ? (
                    <McnButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-[var(--mcn-fg-subtle)] hover:text-red-400"
                      onClick={() => deleteTask(task.id)}
                      aria-label="Supprimer la tâche"
                    >
                      <Trash2 className="size-3.5" />
                    </McnButton>
                  ) : null}
                </div>
              </McnCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
