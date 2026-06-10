"use client";

import { useState, useTransition } from "react";
import { CtModal } from "@/components/control-tower/ct-modal";
import { createSession } from "@/lib/control-tower/actions";
import { SESSION_DOMAINS } from "@/lib/control-tower/types";
import type { SessionDomain, WorkSession } from "@/lib/control-tower/types";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DashboardSessionsProps = {
  sessions: WorkSession[];
};

export function DashboardSessions({ sessions }: DashboardSessionsProps) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState<SessionDomain>("business");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    const durationMinutes =
      Math.max(0, parseInt(hours, 10) || 0) * 60 +
      Math.max(0, parseInt(minutes, 10) || 0);

    setError(null);
    startTransition(async () => {
      const result = await createSession({
        domain,
        durationMinutes,
        notes,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      setNotes("");
      setHours("1");
      setMinutes("0");
    });
  }

  return (
    <section className="ct-section" aria-labelledby="sessions-heading">
      <h2 id="sessions-heading" className="ct-section-title">
        Sessions de travail
      </h2>
      <div className="ct-card">
        <ul className="ct-session-list">
          {sessions.length === 0 ? (
            <li className="ct-empty">Aucune session enregistrée.</li>
          ) : (
            sessions.map((s) => {
              const label =
                SESSION_DOMAINS.find((d) => d.value === s.domain)?.label ??
                s.domain;
              return (
                <li key={s.id} className="ct-session-item">
                  <div className="ct-session-top">
                    <span className={`ct-domain-pill ct-domain-${s.domain}`}>
                      {label}
                    </span>
                    <span className="ct-session-duration">
                      {formatDuration(s.duration_minutes)}
                    </span>
                  </div>
                  {s.notes ? (
                    <p className="ct-session-notes">{s.notes}</p>
                  ) : null}
                  <p className="ct-session-when">{formatWhen(s.created_at)}</p>
                </li>
              );
            })
          )}
        </ul>
        <button
          type="button"
          className="ct-btn ct-btn-primary ct-btn-block"
          onClick={() => setOpen(true)}
        >
          + Logger une session
        </button>
      </div>

      <CtModal open={open} title="Nouvelle session" onClose={() => setOpen(false)}>
        <label className="ct-label">Domaine</label>
        <select
          className="ct-input ct-select"
          value={domain}
          onChange={(e) => setDomain(e.target.value as SessionDomain)}
        >
          {SESSION_DOMAINS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <label className="ct-label">Durée</label>
        <div className="ct-duration-row">
          <input
            className="ct-input"
            type="number"
            min={0}
            max={12}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <span className="ct-duration-unit">h</span>
          <input
            className="ct-input"
            type="number"
            min={0}
            max={59}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
          <span className="ct-duration-unit">min</span>
        </div>

        <label className="ct-label">Notes</label>
        <textarea
          className="ct-input ct-textarea"
          rows={3}
          placeholder="Ce que tu as fait…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error ? (
          <p className="ct-form-hint ct-form-hint-error">{error}</p>
        ) : null}

        <button
          type="button"
          className="ct-btn ct-btn-primary ct-btn-block"
          style={{ marginTop: "0.75rem" }}
          disabled={pending}
          onClick={submit}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </CtModal>
    </section>
  );
}
