/** Limites produit Uberly — backend source of truth. */
export const UBERLY_LIMITS = {
  /** Analyses gratuites par jour (utilisateurs non premium). */
  freeDailyAnalyses: 5,
  /** Historique visible pour les utilisateurs gratuits. */
  freeHistoryDays: 7,
  /** Taille max upload capture (10 Mo). */
  maxImageBytes: 10 * 1024 * 1024,
  /** Rate limit location : requêtes / heure / utilisateur. */
  locationRequestsPerHour: 120,
  /** Rate limit feedback : requêtes / minute / utilisateur. */
  feedbackRequestsPerMinute: 10,
} as const;
