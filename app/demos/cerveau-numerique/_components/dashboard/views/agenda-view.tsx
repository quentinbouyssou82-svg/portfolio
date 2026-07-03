"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Mic,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { cn } from "../../../_lib/cn";
import { AGENDA_VIEWS } from "../../../_lib/dashboard-data";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/** Build a 6-week grid (Mon-first) for the given month. */
function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function AgendaView() {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selected, setSelected] = useState(today);

  const days = useMemo(
    () => buildMonth(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const rangeLabel = useMemo(() => {
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) =>
      `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 4)}.`;
    return `${monday.getDate()} ${MONTHS[monday.getMonth()].slice(0, 4)} – ${fmt(sunday)} ${sunday.getFullYear()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shift = (delta: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full shrink-0 border-b border-[var(--cn-border)] p-4 md:w-64 md:border-b-0 md:border-r">
        <button className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--cn-grad-primary)] py-2.5 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5">
          <Plus className="size-4" />
          Nouveau RDV
        </button>

        <div className="mb-2 flex items-center justify-between px-1">
          <button
            onClick={() => shift(-1)}
            className="text-[var(--cn-faint)] hover:text-[var(--cn-fg)]"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-xs font-medium">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <button
            onClick={() => shift(1)}
            className="text-[var(--cn-faint)] hover:text-[var(--cn-fg)]"
            aria-label="Mois suivant"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-[var(--cn-faint)]">
          {WEEKDAYS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-xs">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = d.toDateString() === today.toDateString();
            const isSelected = d.toDateString() === selected.toDateString();
            return (
              <button
                key={i}
                onClick={() => setSelected(d)}
                className={cn(
                  "mx-auto flex size-6 items-center justify-center rounded-md transition-colors",
                  !inMonth && "text-[var(--cn-ghost)]",
                  inMonth && "text-[var(--cn-muted)]",
                  isSelected && "bg-[var(--cn-primary)] text-white",
                  isToday && !isSelected && "text-[var(--cn-primary)]",
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main calendar */}
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--cn-border)] px-4 py-2.5">
          <button className="flex size-8 items-center justify-center rounded-lg border border-[var(--cn-border)] text-[var(--cn-muted)] hover:text-[var(--cn-fg)]">
            <ChevronLeft className="size-4" />
          </button>
          <button className="rounded-lg border border-[var(--cn-border)] px-3 py-1.5 text-xs font-medium text-[var(--cn-muted)] hover:text-[var(--cn-fg)]">
            Aujourd&apos;hui
          </button>
          <button className="flex size-8 items-center justify-center rounded-lg border border-[var(--cn-border)] text-[var(--cn-muted)] hover:text-[var(--cn-fg)]">
            <ChevronRight className="size-4" />
          </button>
          <span className="ml-2 text-sm font-semibold">{rangeLabel}</span>

          <div className="ml-auto flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#22c55e]/40 bg-[#22c55e]/10 px-3 py-1.5 text-xs font-medium text-[#4ade80]">
              <Mic className="size-3.5" />
              Réunion
            </button>
            <select className="rounded-lg border border-[var(--cn-border)] bg-[var(--cn-surface)] px-2 py-1.5 text-xs text-[var(--cn-fg)]" defaultValue="week7">
              {AGENDA_VIEWS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
            <button
              aria-label="Rafraîchir"
              className="flex size-8 items-center justify-center rounded-lg border border-[var(--cn-border)] text-[var(--cn-faint)]"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/[0.06] px-4 py-2.5 text-sm text-[#f87171]">
            <TriangleAlert className="size-4" />
            Gmail non connecté
          </div>
        </div>
      </div>
    </div>
  );
}
