"use client";

import { useState, useTransition } from "react";
import {
  createTask,
  cycleTaskStatus,
  deleteTask,
  saveFocusOfDay,
} from "@/lib/control-tower/actions";
import type { Task, TaskStatus } from "@/lib/control-tower/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "À faire",
  doing: "En cours",
  done: "Fait",
};

type DashboardTodayProps = {
  focusOfDay: string | null;
  tasks: Task[];
};

export function DashboardToday({ focusOfDay, tasks }: DashboardTodayProps) {
  const [newTitle, setNewTitle] = useState("");
  const [focus, setFocus] = useState(focusOfDay ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message ?? "Erreur");
      else setNewTitle("");
    });
  }

  return (
    <section className="ct-section ct-section-priority" aria-labelledby="today-heading">
      <h2 id="today-heading" className="ct-section-title">
        Aujourd&apos;hui — exécution
      </h2>
      <div className="ct-card ct-card-highlight">
        <div className="ct-focus-block">
          <label htmlFor="ct-focus" className="ct-metric-label">
            Focus du jour
          </label>
          <div className="ct-focus-row">
            <input
              id="ct-focus"
              className="ct-input ct-input-ghost"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Ex. Acquisition + shipping produit"
            />
            <button
              type="button"
              className="ct-btn"
              disabled={pending}
              onClick={() => run(() => saveFocusOfDay(focus))}
            >
              Enregistrer
            </button>
          </div>
        </div>

        <ul className="ct-task-list">
          {tasks.length === 0 ? (
            <li className="ct-empty">Aucune tâche — ajoute-en une ci-dessous.</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="ct-task-item">
                <button
                  type="button"
                  className={`ct-task-status ct-status-${task.status}`}
                  disabled={pending}
                  onClick={() => run(() => cycleTaskStatus(task.id))}
                  title="Changer le statut"
                >
                  {STATUS_LABEL[task.status]}
                </button>
                <span
                  className={
                    task.status === "done" ? "ct-task-title-done" : "ct-task-title"
                  }
                >
                  {task.title}
                </span>
                <button
                  type="button"
                  className="ct-btn ct-btn-ghost ct-btn-icon"
                  disabled={pending}
                  onClick={() => run(() => deleteTask(task.id))}
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>

        {tasks.length < 3 ? (
          <div className="ct-task-add">
            <input
              className="ct-input"
              placeholder="Nouvelle tâche…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTitle.trim()) {
                  run(() => createTask(newTitle));
                }
              }}
              disabled={pending}
            />
            <button
              type="button"
              className="ct-btn ct-btn-primary"
              disabled={pending || !newTitle.trim()}
              onClick={() => run(() => createTask(newTitle))}
            >
              + Ajouter
            </button>
          </div>
        ) : (
          <span className="ct-badge">3 / 3 tâches</span>
        )}

        {error ? <p className="ct-form-hint ct-form-hint-error">{error}</p> : null}
      </div>
    </section>
  );
}
