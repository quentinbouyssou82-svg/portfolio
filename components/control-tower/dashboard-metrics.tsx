"use client";

import { useState, useTransition } from "react";
import { saveDailyMetrics } from "@/lib/control-tower/actions";
import type { MetricsDaily } from "@/lib/control-tower/types";

type DashboardMetricsProps = {
  metrics: MetricsDaily | null;
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const [sleep, setSleep] = useState(
    metrics?.sleep_hours?.toString() ?? "",
  );
  const [screen, setScreen] = useState(
    metrics?.screen_time_minutes != null
      ? String(metrics.screen_time_minutes)
      : "",
  );
  const [weight, setWeight] = useState(
    metrics?.weight_kg?.toString() ?? "",
  );
  const [sportDone, setSportDone] = useState(metrics?.sport_done ?? false);
  const [sportType, setSportType] = useState(metrics?.sport_type ?? "");
  const [energy, setEnergy] = useState(
    metrics?.energy_score?.toString() ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await saveDailyMetrics({
        sleep_hours: sleep ? parseFloat(sleep) : null,
        screen_time_minutes: screen ? parseInt(screen, 10) : null,
        weight_kg: weight ? parseFloat(weight) : null,
        sport_done: sportDone,
        sport_type: sportType || null,
        energy_score: energy ? parseInt(energy, 10) : null,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <section className="ct-section" aria-labelledby="metrics-heading">
      <h2 id="metrics-heading" className="ct-section-title">
        Métriques vie
      </h2>
      <div className="ct-metrics-grid">
        <div className="ct-card ct-metric-field">
          <label className="ct-metric-label">Sommeil (h)</label>
          <input
            className="ct-input"
            type="number"
            step="0.5"
            min={0}
            max={24}
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
          />
        </div>
        <div className="ct-card ct-metric-field">
          <label className="ct-metric-label">Screen time (min)</label>
          <input
            className="ct-input"
            type="number"
            min={0}
            value={screen}
            onChange={(e) => setScreen(e.target.value)}
          />
        </div>
        <div className="ct-card ct-metric-field">
          <label className="ct-metric-label">Poids (kg)</label>
          <input
            className="ct-input"
            type="number"
            step="0.1"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="ct-card ct-metric-field">
          <label className="ct-metric-label">Énergie (1–10)</label>
          <input
            className="ct-input"
            type="number"
            min={1}
            max={10}
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
          />
        </div>
        <div className="ct-card ct-metric-field ct-metric-field-wide">
          <label className="ct-label ct-sport-row">
            <input
              type="checkbox"
              checked={sportDone}
              onChange={(e) => setSportDone(e.target.checked)}
            />
            Sport aujourd&apos;hui
          </label>
          <input
            className="ct-input"
            placeholder="Type (run, muscu…)"
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            disabled={!sportDone}
          />
        </div>
      </div>
      <div className="ct-metrics-actions">
        <button
          type="button"
          className="ct-btn ct-btn-primary"
          disabled={pending}
          onClick={save}
        >
          {pending ? "Enregistrement…" : "Sauvegarder le jour"}
        </button>
        {saved ? <span className="ct-save-ok">Enregistré ✓</span> : null}
        {error ? (
          <p className="ct-form-hint ct-form-hint-error">{error}</p>
        ) : null}
      </div>
    </section>
  );
}
