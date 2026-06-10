"use client";

import { useState, useTransition } from "react";
import { addBusinessMetric } from "@/lib/control-tower/actions";
import { PIPELINE_STAGES } from "@/lib/control-tower/types";
import type { BusinessMetricType } from "@/lib/control-tower/types";

type DashboardPipelineProps = {
  totals: Record<BusinessMetricType, number>;
};

function formatTotal(type: BusinessMetricType, value: number): string {
  if (type === "revenue") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return String(Math.round(value));
}

export function DashboardPipeline({ totals }: DashboardPipelineProps) {
  const [adding, setAdding] = useState<BusinessMetricType | null>(null);
  const [amount, setAmount] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(type: BusinessMetricType) {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Valeur invalide");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addBusinessMetric(type, value);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setAdding(null);
      setAmount("1");
    });
  }

  return (
    <section className="ct-section" aria-labelledby="pipeline-heading">
      <h2 id="pipeline-heading" className="ct-section-title">
        Pipeline business
      </h2>
      <div className="ct-card">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.type} className="ct-pipeline-row">
            <span className="ct-pipeline-label">{stage.label}</span>
            <div className="ct-pipeline-right">
              <span className="ct-pipeline-value">
                {formatTotal(stage.type, totals[stage.type] ?? 0)}
              </span>
              <button
                type="button"
                className="ct-btn ct-btn-ghost ct-btn-sm"
                onClick={() => {
                  setAdding(stage.type);
                  setAmount(stage.type === "revenue" ? "100" : "1");
                }}
              >
                +
              </button>
            </div>
            {adding === stage.type ? (
              <div className="ct-pipeline-add">
                <input
                  className="ct-input"
                  type="number"
                  min={0}
                  step={stage.type === "revenue" ? "100" : "1"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button
                  type="button"
                  className="ct-btn ct-btn-primary ct-btn-sm"
                  disabled={pending}
                  onClick={() => submit(stage.type)}
                >
                  OK
                </button>
                <button
                  type="button"
                  className="ct-btn ct-btn-ghost ct-btn-sm"
                  onClick={() => setAdding(null)}
                >
                  Annuler
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {error ? (
          <p className="ct-form-hint ct-form-hint-error">{error}</p>
        ) : null}
      </div>
    </section>
  );
}
