"use client";

import { useState } from "react";
import { Search, FileText, CheckSquare, Mail, Calendar, ChevronDown } from "lucide-react";
import { cn } from "../../../_lib/cn";
import { SEARCH_TYPES, SEARCH_SUGGESTIONS } from "../../../_lib/dashboard-data";

const typeIcons = { documents: FileText, tasks: CheckSquare, mails: Mail, agenda: Calendar };

export function SearchView() {
  const [types, setTypes] = useState<string[]>([
    "documents",
    "tasks",
    "mails",
    "agenda",
  ]);
  const toggle = (id: string) =>
    setTypes((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      <aside className="w-full shrink-0 border-b border-[var(--cn-border)] p-4 md:w-56 md:border-b-0 md:border-r">
        <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--cn-faint)]">
          Types
        </p>
        <div className="space-y-1.5">
          {SEARCH_TYPES.map((t) => {
            const Icon = typeIcons[t.id as keyof typeof typeIcons];
            const active = types.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-[var(--cn-border)] bg-[var(--cn-surface)]"
                    : "border-transparent text-[var(--cn-faint)] hover:bg-white/[0.03]",
                )}
                style={active ? { color: t.color } : undefined}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--cn-faint)]" />
            <input
              placeholder="Rechercher..."
              className="w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] focus:border-[var(--cn-primary-border)]"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-[var(--cn-muted)]">
            <input type="checkbox" className="accent-[var(--cn-primary)]" />
            Archivés
          </label>
          <button className="flex size-9 items-center justify-center rounded-lg bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
            <Search className="size-4" />
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-[var(--cn-border)] px-3 py-2 text-xs text-[var(--cn-muted)]">
            Dates
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <Search className="size-9 text-[var(--cn-faint)]" strokeWidth={1.5} />
          <p className="text-sm text-[var(--cn-faint)]">
            Documents · Mails · Tâches · Agenda
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SEARCH_SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="rounded-full border border-[var(--cn-border)] bg-[var(--cn-surface)] px-3 py-1.5 text-xs text-[var(--cn-muted)] transition-colors hover:text-[var(--cn-fg)]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
