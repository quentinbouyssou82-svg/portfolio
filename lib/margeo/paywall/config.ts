/**
 * Config paywall Driveely — copy, essai, CTAs, features orientées résultat.
 */

export const PAYWALL_TRIAL_DAYS = 14;
export const PAYWALL_REMINDER_DAY = 12;

/** Friction carte (désactivée en bêta ; activable pour A/B plus tard). */
export const PAYWALL_REQUIRE_CARD = false;

export const PAYWALL_STORAGE_SEEN = "driveely-paywall-seen";
export const PAYWALL_STORAGE_BANNER_DISMISS = "driveely-paywall-banner-dismiss";

export type PaywallSource =
  | "onboarding"
  | "quota"
  | "nav"
  | "banner"
  | "direct"
  | "exit"
  | "all_plans";

export type PaywallScreen = "vision" | "personalized" | "offer" | "exit";

export const PAYWALL_RESULT_FEATURES = [
  "Décide en quelques secondes avant d'accepter",
  "Évite les courses qui mangent ton marge",
  "Vise ton objectif €/h sur chaque proposition",
  "Analyses illimitées, historique complet",
] as const;

export const PAYWALL_GUARANTEES = [
  "Annulation à tout moment",
  "Aucun engagement",
  "Rappel avant facturation",
] as const;

export const PAYWALL_COPY = {
  visionEyebrow: "Ton prochain mois",
  visionTitle: "Dans 30 jours, tu pourras…",
  visionContinue: "Voir mon plan →",
  persoEyebrow: "Personnalisé pour toi",
  persoTitle: "Ton plan est prêt",
  persoSubtitle: "Voici ce que Driveely aligne sur ton rythme.",
  persoContinue: "Voir l'offre →",
  offerEyebrow: "Pro",
  offerTitle: "Commence ton essai gratuit",
  offerCta: "Commencer mon essai gratuit →",
  offerCtaUnlock: "Débloquer mon plan →",
  offerSkip: "Plus tard",
  offerAllPlans: "Voir tous les plans",
  annualBadge: "Recommandé",
  annualSave: "Économisez",
  monthlyLabel: "Mensuel",
  annualLabel: "12 mois Pro",
  trialNote: "Puis facturation — annulable en 1 clic",
  disclaimer:
    "Projections indicatives, basées sur ton profil. Pas une garantie de revenus.",
  exitTitle: "Avant de partir…",
  exitSubtitle: "Tu préfères commencer plus doucement ?",
  exitMonthly: "Essayer Pro au mois →",
  exitFree: "Continuer en gratuit (2 analyses/jour)",
  socialQuote:
    "Driveely m'a évité plusieurs courses à perte la première semaine.",
  socialMeta: "Livreurs en bêta · estimation indicative",
} as const;

export const PAYWALL_VISION_BULLETS = [
  {
    title: "Décider sans stress",
    body: "Une estimation nette en quelques secondes, avant l'expiration.",
  },
  {
    title: "Protéger ta marge",
    body: "Carburant, usure, retour à vide — pris en compte avant d'accepter.",
  },
  {
    title: "Tenir ton objectif",
    body: "Chaque proposition confrontée à ton €/h cible.",
  },
] as const;
