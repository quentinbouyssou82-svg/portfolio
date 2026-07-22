/**
 * Offres Driveely — 3 niveaux.
 * Objectif : rendre l'offre Pro (intermédiaire) évidente.
 * Premium/Elite = confort avancé, jamais indispensable.
 */

export type DriveelyPlanId = "discovery" | "pro" | "elite";

export interface DriveelyPlan {
  id: DriveelyPlanId;
  /** Nom commercial impactant */
  name: string;
  /** Tagline courte sous le nom */
  tagline: string;
  priceMonthly: number;
  /** Prix annuel TTC (null = gratuit / N/A) */
  priceYearly: number | null;
  /** null = illimité */
  dailyAnalyses: number | null;
  historyDays: number | null;
  featured: boolean;
  badge?: string;
  cta: string;
  ctaSecondary?: string;
  features: string[];
  /** Features absentes (affichées barrées ou en “—” sur la carte) */
  missing?: string[];
}

export const DRIVEELY_PLANS: Record<DriveelyPlanId, DriveelyPlan> = {
  discovery: {
    id: "discovery",
    name: "Découverte",
    tagline: "Juste pour tester Driveely.",
    priceMonthly: 0,
    priceYearly: null,
    dailyAnalyses: 2,
    historyDays: 3,
    featured: false,
    cta: "Plan actuel",
    features: [
      "2 analyses / jour",
      "Score + verdict IA",
      "Historique 3 jours",
    ],
    missing: [
      "Dashboard complet",
      "Zones rentables",
      "Objectifs & sync",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Tout ce qu'il faut, chaque jour.",
    priceMonthly: 4.99,
    priceYearly: 39.99,
    dailyAnalyses: null,
    historyDays: null,
    featured: true,
    badge: "Recommandé",
    cta: "Passer en Pro — 14 j offerts",
    ctaSecondary: "Sans engagement. Annulable en 1 clic.",
    features: [
      "Analyses illimitées",
      "Historique complet",
      "Dashboard & objectifs",
      "Zones rentables",
      "Toutes les analyses IA",
      "Synchronisation multi-appareils",
      "Support standard",
    ],
  },
  elite: {
    id: "elite",
    name: "Elite",
    tagline: "Pour les livreurs intensifs.",
    priceMonthly: 8.99,
    priceYearly: 69.99,
    dailyAnalyses: null,
    historyDays: null,
    featured: false,
    badge: "Intensif",
    cta: "Passer en Elite",
    ctaSecondary: "Tout Pro + outils avancés.",
    features: [
      "Tout Pro inclus",
      "Export CSV / compta",
      "Rapports & stats poussées",
      "Insights IA avancés",
      "Support prioritaire",
      "Accès anticipé aux betas",
    ],
  },
};

export const DRIVEELY_PLAN_ORDER: DriveelyPlanId[] = ["discovery", "pro", "elite"];

/** Copy pricing page */
export const DRIVEELY_PRICING_COPY = {
  eyebrow: "Tarifs clairs",
  title: "Choisis ton rythme. Garde ton avantage.",
  subtitle:
    "Commence gratuitement. Passe en Pro dès que 2 analyses/jour ne suffisent plus.",
  comparisonTitle: "Comparer les offres",
  trialToastTitle: "Essai Pro activé",
  trialToastDesc:
    "14 jours d'analyses illimitées. Aucun prélèvement avant la fin de l'essai.",
  eliteToastTitle: "Essai Elite activé",
  eliteToastDesc:
    "14 jours Elite. Tu pourras rétrograder en Pro à tout moment.",
} as const;

export function formatPlanPrice(price: number): string {
  if (price === 0) return "0 €";
  return `${price.toFixed(2).replace(".", ",")} €`;
}

/** Économie annuelle vs 12× mensuel (0 si non applicable). */
export function yearlySavingsPercent(planId: DriveelyPlanId): number {
  const plan = DRIVEELY_PLANS[planId];
  if (!plan.priceYearly || plan.priceMonthly <= 0) return 0;
  const full = plan.priceMonthly * 12;
  return Math.round(((full - plan.priceYearly) / full) * 100);
}

export function formatYearlyEquivalentMonthly(priceYearly: number): string {
  return formatPlanPrice(priceYearly / 12);
}
