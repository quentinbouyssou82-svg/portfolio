import { analyzeOffer } from "./engine";
import type { Platform, RideAnalysis, RideOffer, UserProfile } from "./types";

export const DEMO_PROFILE: UserProfile = {
  name: "Karim Belaïdi",
  city: "Lyon",
  vehicle: "scooter",
  costPerKm: 0.24,
  targetHourly: 16,
  dailyTarget: 90,
  premium: false,
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  "Uber Eats": "#06c167",
  Deliveroo: "#00ccbc",
  Shopopop: "#ff5a5f",
  Stuart: "#5c6cff",
  "Amazon Flex": "#ff9900",
};

/** Heures d'analyse relatives (en minutes avant maintenant) pour l'historique. */
const MINUTES_AGO = [
  14, 52, 96, 168, 245, 1_320, 1_395, 1_480, 2_750, 2_870, 4_260, 4_390,
];

function agoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const OFFERS: RideOffer[] = [
  {
    id: "rd-101",
    platform: "Uber Eats",
    pickup: "Burger Père & Fils, Presqu'île",
    dropoff: "Quai Claude Bernard",
    payout: 7.9,
    distanceKm: 3.2,
    durationMin: 16,
    emptyReturnKm: 0.8,
  },
  {
    id: "rd-102",
    platform: "Deliveroo",
    pickup: "Sushi Kyo, Part-Dieu",
    dropoff: "Montchat",
    payout: 5.1,
    distanceKm: 4.6,
    durationMin: 24,
    emptyReturnKm: 3.4,
  },
  {
    id: "rd-103",
    platform: "Shopopop",
    pickup: "Drive Carrefour Vénissieux",
    dropoff: "Saint-Fons",
    payout: 14.5,
    distanceKm: 9.8,
    durationMin: 34,
    emptyReturnKm: 4.2,
  },
  {
    id: "rd-104",
    platform: "Uber Eats",
    pickup: "Tacos Avenue, Guillotière",
    dropoff: "Gerland",
    payout: 3.4,
    distanceKm: 4.1,
    durationMin: 22,
    emptyReturnKm: 3.8,
  },
  {
    id: "rd-105",
    platform: "Stuart",
    pickup: "Pharmacie de l'Opéra",
    dropoff: "Croix-Rousse",
    payout: 11.2,
    distanceKm: 4.9,
    durationMin: 21,
    emptyReturnKm: 1.6,
  },
  {
    id: "rd-106",
    platform: "Amazon Flex",
    pickup: "Dépôt DLY3, Corbas",
    dropoff: "Tournée Bron (12 colis)",
    payout: 54,
    distanceKm: 38,
    durationMin: 165,
    emptyReturnKm: 11,
  },
  {
    id: "rd-107",
    platform: "Deliveroo",
    pickup: "Pizza Cosy, Vieux Lyon",
    dropoff: "Fourvière",
    payout: 6.8,
    distanceKm: 2.4,
    durationMin: 19,
    emptyReturnKm: 2.1,
  },
  {
    id: "rd-108",
    platform: "Uber Eats",
    pickup: "KFC Part-Dieu",
    dropoff: "Villeurbanne Gratte-Ciel",
    payout: 9.6,
    distanceKm: 5.2,
    durationMin: 23,
    emptyReturnKm: 1.2,
  },
  {
    id: "rd-109",
    platform: "Shopopop",
    pickup: "Drive Leclerc Écully",
    dropoff: "Dardilly",
    payout: 8.2,
    distanceKm: 11.4,
    durationMin: 38,
    emptyReturnKm: 9.6,
  },
  {
    id: "rd-110",
    platform: "Stuart",
    pickup: "Boutique Sézane, Terreaux",
    dropoff: "Brotteaux",
    payout: 12.8,
    distanceKm: 3.8,
    durationMin: 18,
    emptyReturnKm: 0.9,
  },
  {
    id: "rd-111",
    platform: "Deliveroo",
    pickup: "Bao Express, Bellecour",
    dropoff: "Confluence",
    payout: 4.3,
    distanceKm: 3.5,
    durationMin: 21,
    emptyReturnKm: 2.9,
  },
  {
    id: "rd-112",
    platform: "Uber Eats",
    pickup: "McDonald's Mermoz",
    dropoff: "Bachut",
    payout: 8.4,
    distanceKm: 2.9,
    durationMin: 14,
    emptyReturnKm: 1.1,
  },
];

/** Historique complet, trié du plus récent au plus ancien. */
export const DEMO_ANALYSES: RideAnalysis[] = OFFERS.map((offer, i) =>
  analyzeOffer(offer, DEMO_PROFILE, agoIso(MINUTES_AGO[i] ?? 5_000))
);

/**
 * Pool de courses "fraîches" servies par le faux moteur OCR
 * quand l'utilisateur dépose une capture d'écran.
 */
export const INCOMING_OFFERS: RideOffer[] = [
  {
    id: "scan-201",
    platform: "Uber Eats",
    pickup: "Five Guys, Confluence",
    dropoff: "Sainte-Foy-lès-Lyon",
    payout: 10.4,
    distanceKm: 6.1,
    durationMin: 26,
    emptyReturnKm: 4.8,
  },
  {
    id: "scan-202",
    platform: "Deliveroo",
    pickup: "Chez Antoinette, Terreaux",
    dropoff: "Caluire-et-Cuire",
    payout: 4.9,
    distanceKm: 5.4,
    durationMin: 27,
    emptyReturnKm: 4.6,
  },
  {
    id: "scan-203",
    platform: "Stuart",
    pickup: "Apple Store Part-Dieu",
    dropoff: "Préfecture",
    payout: 13.6,
    distanceKm: 3.1,
    durationMin: 17,
    emptyReturnKm: 0.7,
  },
  {
    id: "scan-204",
    platform: "Shopopop",
    pickup: "Drive Auchan Caluire",
    dropoff: "Rillieux-la-Pape",
    payout: 12.1,
    distanceKm: 7.6,
    durationMin: 29,
    emptyReturnKm: 3.1,
  },
  {
    id: "scan-205",
    platform: "Uber Eats",
    pickup: "O'Tacos Guillotière",
    dropoff: "Monplaisir",
    payout: 3.1,
    distanceKm: 3.9,
    durationMin: 23,
    emptyReturnKm: 3.2,
  },
];

/** Sélectionne une course du pool comme si l'OCR venait de la lire. */
export function pickIncomingOffer(seed?: number): RideOffer {
  const index =
    seed !== undefined
      ? Math.abs(seed) % INCOMING_OFFERS.length
      : Math.floor(Math.random() * INCOMING_OFFERS.length);
  return INCOMING_OFFERS[index];
}

/** Points du graphique "gain net par jour" sur 14 jours, en euros. */
export const EARNINGS_SERIES: { day: string; net: number }[] = [
  { day: "Lun", net: 64 },
  { day: "Mar", net: 78 },
  { day: "Mer", net: 51 },
  { day: "Jeu", net: 92 },
  { day: "Ven", net: 104 },
  { day: "Sam", net: 128 },
  { day: "Dim", net: 87 },
  { day: "Lun", net: 71 },
  { day: "Mar", net: 83 },
  { day: "Mer", net: 66 },
  { day: "Jeu", net: 98 },
  { day: "Ven", net: 112 },
  { day: "Sam", net: 139 },
  { day: "Dim", net: 96 },
];

export interface DashboardStats {
  todayNet: number;
  todayDelta: number;
  avgScore: number;
  analyzedCount: number;
  acceptedShare: number;
}

export function getDashboardStats(): DashboardStats {
  const scores = DEMO_ANALYSES.map((a) => a.score);
  const avgScore = Math.round(
    scores.reduce((sum, s) => sum + s, 0) / scores.length
  );
  const accepted = DEMO_ANALYSES.filter((a) => a.verdict === "accept").length;
  return {
    todayNet: 68.4,
    todayDelta: 12.6,
    avgScore,
    analyzedCount: 128,
    acceptedShare: Math.round((accepted / DEMO_ANALYSES.length) * 100),
  };
}

export function getAnalysisById(id: string): RideAnalysis | undefined {
  return DEMO_ANALYSES.find((a) => a.id === id);
}
