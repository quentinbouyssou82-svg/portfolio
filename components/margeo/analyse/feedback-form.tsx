"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/margeo/ui/button";
import { Card } from "@/components/margeo/ui/card";
import { Input } from "@/components/margeo/ui/input";
import { trackMargeoEvent } from "@/lib/margeo/analytics";
import type { RideAnalysis } from "@/lib/margeo/types";
import { cn } from "@/lib/margeo/utils";

type Step = "accept" | "reason" | "outcome" | "done";

const REASONS_ACCEPT = [
  { id: "good_opportunity", label: "Bonne opportunité" },
  { id: "close", label: "Proche du restaurant" },
  { id: "good_pay", label: "Bon gain" },
  { id: "other", label: "Autre" },
] as const;

const REASONS_REFUSE = [
  { id: "too_low", label: "Trop faible" },
  { id: "too_far", label: "Trop loin" },
  { id: "bad_zone", label: "Mauvaise zone" },
  { id: "uberly_right", label: "Uberly avait raison" },
  { id: "other", label: "Autre" },
] as const;

export function FeedbackForm({ analysis }: { analysis: RideAnalysis }) {
  const [step, setStep] = useState<Step>("accept");
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [duration, setDuration] = useState(
    String(analysis.offer.durationMin ?? ""),
  );
  const [gain, setGain] = useState(String(analysis.grossGain));
  const [distance, setDistance] = useState(
    String(analysis.offer.distanceKm ?? ""),
  );
  const [loading, setLoading] = useState(false);

  const reasons = accepted ? REASONS_ACCEPT : REASONS_REFUSE;

  const submit = async (didAccept: boolean, selectedReason?: string | null) => {
    setLoading(true);
    try {
      const res = await fetch("/api/uberly/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: analysis.id,
          accepted: didAccept,
          actualDurationMin: duration ? Number(duration) : undefined,
          actualGain: gain ? Number(gain) : undefined,
          actualDistanceKm: distance ? Number(distance) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur");
      }

      trackMargeoEvent("margeo_feedback_submitted", {
        accepted: didAccept,
        analysis_id: analysis.id,
        ...(selectedReason ?? reason
          ? { reason: selectedReason ?? reason }
          : {}),
      });

      setStep("done");
      toast.success("Merci", {
        description: "Ton retour améliore tes prochains verdicts.",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Impossible d'enregistrer");
    } finally {
      setLoading(false);
    }
  };

  if (step === "done") {
    return (
      <Card className="border-mg-accent/20 bg-mg-accent-soft/30 p-5 text-center">
        <p className="text-sm font-medium text-mg-foreground">
          Feedback enregistré
        </p>
        <p className="mt-1 text-xs text-mg-muted">
          Tes prochains verdicts seront plus précis.
        </p>
      </Card>
    );
  }

  if (step === "accept") {
    return (
      <Card className="p-5 sm:p-6">
        <p className="text-sm font-semibold text-mg-foreground">
          Tu l&apos;as acceptée ?
        </p>
        <p className="mt-1 text-xs text-mg-muted">
          Optionnel — ça affine tes stats.
        </p>
        <div className="mt-4 flex gap-3">
          <Button
            className="min-h-11 flex-1"
            variant="secondary"
            onClick={() => {
              setAccepted(true);
              setStep("reason");
            }}
          >
            Oui, acceptée
          </Button>
          <Button
            className="min-h-11 flex-1"
            variant="secondary"
            onClick={() => {
              setAccepted(false);
              setStep("reason");
            }}
          >
            Non, refusée
          </Button>
        </div>
      </Card>
    );
  }

  if (step === "reason") {
    return (
      <Card className="p-5 sm:p-6">
        <p className="text-sm font-semibold text-mg-foreground">Pourquoi ?</p>
        <p className="mt-1 text-xs text-mg-muted">Un tap suffit.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReason(r.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-2 text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-mg-accent/40",
                reason === r.id
                  ? "border-mg-accent/40 bg-mg-accent-soft text-mg-accent"
                  : "border-mg-border text-mg-muted hover:border-mg-border-strong",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="min-h-11 flex-1"
            onClick={() => {
              if (accepted) {
                setStep("outcome");
              } else {
                void submit(false, reason);
              }
            }}
            disabled={loading}
          >
            {accepted ? "Continuer" : loading ? "Envoi…" : "Envoyer"}
          </Button>
          <Button
            className="min-h-11"
            variant="ghost"
            onClick={() => {
              if (accepted) {
                setStep("outcome");
              } else {
                void submit(false);
              }
            }}
            disabled={loading}
          >
            Passer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-sm font-semibold text-mg-foreground">
        Quel était le résultat ?
      </p>
      <p className="mt-1 text-xs text-mg-muted">
        Optionnel — affine tes stats.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-xs text-mg-muted">
          Temps réel (min)
          <Input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1"
          />
        </label>
        <label className="block text-xs text-mg-muted">
          Gain réel (€)
          <Input
            type="number"
            step="0.1"
            min={0}
            value={gain}
            onChange={(e) => setGain(e.target.value)}
            className="mt-1"
          />
        </label>
        <label className="block text-xs text-mg-muted">
          Distance (km)
          <Input
            type="number"
            step="0.1"
            min={0}
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="mt-1"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          className="min-h-11 flex-1"
          onClick={() => void submit(true, reason)}
          disabled={loading}
        >
          {loading ? "Envoi…" : "Envoyer"}
        </Button>
        <Button
          className="min-h-11"
          variant="ghost"
          onClick={() => void submit(true, reason)}
          disabled={loading}
        >
          Passer
        </Button>
      </div>
    </Card>
  );
}
