export type Platform =
  | "Uber Eats"
  | "Deliveroo"
  | "Shopopop"
  | "Stuart"
  | "Amazon Flex";

export type Vehicle = "velo" | "scooter" | "voiture";

export type Verdict = "accept" | "check" | "refuse";

/** Proposition de course telle qu'extraite d'une capture d'écran. */
export interface RideOffer {
  id: string;
  platform: Platform;
  pickup: string;
  dropoff: string;
  /** Gain brut proposé par la plateforme, en euros. */
  payout: number;
  /** Distance totale de la course, en km. */
  distanceKm: number;
  /** Durée totale estimée (attente + trajet), en minutes. */
  durationMin: number;
  /** Retour à vide estimé après la livraison, en km. */
  emptyReturnKm: number;
}

/** Résultat complet produit par le moteur d'analyse Margeo. */
export interface RideAnalysis {
  id: string;
  offer: RideOffer;
  /** Date ISO de l'analyse. */
  analyzedAt: string;
  grossGain: number;
  estimatedCost: number;
  netGain: number;
  /** Taux horaire net, en €/h. */
  hourlyRate: number;
  /** Score de rentabilité, 0 à 100. */
  score: number;
  verdict: Verdict;
  /** Explication principale, rédigée. */
  explanation: string;
  /** Points d'attention secondaires. */
  insights: string[];
}

export interface UserProfile {
  name: string;
  city: string;
  vehicle: Vehicle;
  /** Coût d'exploitation par km (carburant, usure, assurance). */
  costPerKm: number;
  /** Objectif de taux horaire net, en €/h. */
  targetHourly: number;
  /** Objectif de gain net journalier, en €. */
  dailyTarget: number;
  premium: boolean;
}

export interface VerdictMeta {
  label: string;
  emoji: string;
  color: string;
  softColor: string;
  description: string;
}

export const VERDICT_META: Record<Verdict, VerdictMeta> = {
  accept: {
    label: "Accepter",
    emoji: "🟢",
    color: "var(--color-go)",
    softColor: "var(--color-go-soft)",
    description: "Course rentable, fonce.",
  },
  check: {
    label: "À vérifier",
    emoji: "🟠",
    color: "var(--color-check)",
    softColor: "var(--color-check-soft)",
    description: "Rentabilité limite, à toi de juger.",
  },
  refuse: {
    label: "Refuser",
    emoji: "🔴",
    color: "var(--color-stop)",
    softColor: "var(--color-stop-soft)",
    description: "Tu perds de l'argent ou du temps.",
  },
};

export const VEHICLE_LABELS: Record<Vehicle, string> = {
  velo: "Vélo",
  scooter: "Scooter",
  voiture: "Voiture",
};
