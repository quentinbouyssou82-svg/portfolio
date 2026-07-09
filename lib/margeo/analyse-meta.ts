import type { Verdict } from "./types";

/** Libellé qualitatif du score pour rassurer le livreur. */
export function getScoreLabel(score: number, verdict: Verdict): string {
  if (verdict === "refuse") {
    return score < 35 ? "Course à éviter" : "Peu rentable";
  }
  if (verdict === "check") {
    return "Course limite";
  }
  if (score >= 85) return "Excellente course";
  if (score >= 70) return "Bonne course";
  return "Correcte";
}

/** Métadonnées IA renvoyées par POST /api/uberly/analyze (hors RideAnalysis). */
export interface AnalysisMeta {
  confidence?: number;
  warnings?: string[];
  missingFields?: string[];
  extractionQuality?: "complete" | "partial" | "failed";
  source?: string;
}

export const MISSING_FIELD_LABELS: Record<string, string> = {
  payout: "montant de la course",
  distanceKm: "distance",
  durationMin: "temps estimé",
  pickup: "lieu de récupération",
  dropoff: "lieu de livraison",
  platform: "plateforme",
};

export function formatMissingFields(fields: string[]): string {
  const labels = fields
    .map((f) => MISSING_FIELD_LABELS[f] ?? f)
    .filter(Boolean);
  if (labels.length === 0) return "";
  if (labels.length === 1) return `Le ${labels[0]} n'a pas été détecté.`;
  return `Informations estimées : ${labels.join(", ")}.`;
}
