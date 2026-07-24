/**
 * Runtime environment — Driveely
 *
 * Une codebase, deux projets Vercel :
 * - production → produit commercial (freemium, Stripe, paywall)
 * - beta       → bêta privée (tout débloqué, aucun paiement)
 *
 * Source de vérité : DRIVEELY_APP_MODE (+ miroir NEXT_PUBLIC_ pour le client).
 * Ne pas scattered `if (beta)` — passer par `features` / `getAppFeatures()`.
 */

export type DriveelyAppMode = "production" | "beta";

function normalizeMode(raw: string | undefined | null): DriveelyAppMode | null {
  const v = raw?.trim().toLowerCase();
  if (v === "beta" || v === "production") return v;
  return null;
}

/**
 * Résout le mode app.
 * Priorité : NEXT_PUBLIC_ (client+server) → DRIVEELY_APP_MODE (server) → production.
 */
export function getAppMode(): DriveelyAppMode {
  const fromPublic = normalizeMode(process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE);
  if (fromPublic) return fromPublic;

  const fromServer = normalizeMode(process.env.DRIVEELY_APP_MODE);
  if (fromServer) return fromServer;

  // Legacy : DRIVEELY_BETA_MODE=true → beta (migration douce)
  if (
    process.env.DRIVEELY_BETA_MODE === "true" ||
    process.env.UBERLY_BETA_MODE === "true"
  ) {
    return "beta";
  }

  return "production";
}

export function isBetaApp(): boolean {
  return getAppMode() === "beta";
}

export function isProductionApp(): boolean {
  return getAppMode() === "production";
}
