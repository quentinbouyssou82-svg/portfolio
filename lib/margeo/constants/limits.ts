/** Limites produit Driveely — backend source of truth. */
export const DRIVEELY_LIMITS = {
  /** Analyses plan Découverte par jour (non Pro / Elite). */
  freeDailyAnalyses: 2,
  /** Historique visible plan Découverte (jours). */
  freeHistoryDays: 3,
  /** Taille max upload capture (10 Mo). */
  maxImageBytes: 10 * 1024 * 1024,
  /**
   * Durée de conservation des captures d'écran (jours).
   * Purge automatique via /api/driveely/cron/purge-screenshots.
   */
  screenshotRetentionDays: 30,
  /** Rate limit location : requêtes / heure / utilisateur. */
  locationRequestsPerHour: 120,
  /** Rate limit feedback : requêtes / minute / utilisateur. */
  feedbackRequestsPerMinute: 10,
} as const;
