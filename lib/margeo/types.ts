export type Platform =
  | "Uber Eats"
  | "Deliveroo"
  | "Stuart"
  | "Amazon Flex"
  | "Autre";

export type Vehicle = "velo" | "velo_electrique" | "scooter" | "voiture";

export type Verdict = "accept" | "check" | "refuse";

/** Proposition de course telle qu'extraite d'une capture d'écran. */
export interface RideOffer {
  id: string;
  platform: Platform;
  pickup: string;
  dropoff: string;
  /** Gain brut proposé par la plateforme, en euros. */
  payout: number;
  /** Distance totale de la course, en km. Absent si non lu par Vision. */
  distanceKm?: number;
  /** Durée totale estimée (attente + trajet), en minutes. Absent si non lu. */
  durationMin?: number;
  /** Retour à vide estimé après la livraison, en km. */
  emptyReturnKm: number;
  /** Distance du livreur jusqu'au point de récupération, en km. */
  pickupDistanceKm?: number;
}

/** Facteur explicable du score de rentabilité. */
export interface ScoreFactor {
  label: string;
  /** Impact sur le score (-20 à +20 typiquement). */
  impact: number;
  detail: string;
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
  /** Décomposition explicable du score. */
  scoreBreakdown: ScoreFactor[];
}

export interface UserProfile {
  id?: string;
  name: string;
  city: string;
  vehicle: Vehicle;
  costPerKm: number;
  targetHourly: number;
  dailyTarget: number;
  platforms: Platform[];
  otherPlatform?: string;
  premium: boolean;
  premiumUntil?: string;
  premiumSource?: "manual" | "beta" | "stripe" | "trial";
  isBetaTester?: boolean;
  onboardingCompleted?: boolean;
  lastLat?: number;
  lastLng?: number;
  locationPermission?: "granted" | "denied" | "unknown";
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
    color: "var(--color-mg-go)",
    softColor: "var(--color-mg-go-soft)",
    description: "Course rentable, fonce.",
  },
  check: {
    label: "À vérifier",
    emoji: "🟠",
    color: "var(--color-mg-check)",
    softColor: "var(--color-mg-check-soft)",
    description: "Rentabilité limite, à toi de juger.",
  },
  refuse: {
    label: "Refuser",
    emoji: "🔴",
    color: "var(--color-mg-stop)",
    softColor: "var(--color-mg-stop-soft)",
    description: "Tu perds de l'argent ou du temps.",
  },
};

export const VEHICLE_LABELS: Record<Vehicle, string> = {
  velo: "Vélo",
  velo_electrique: "Vélo électrique",
  scooter: "Scooter / Moto",
  voiture: "Voiture",
};
