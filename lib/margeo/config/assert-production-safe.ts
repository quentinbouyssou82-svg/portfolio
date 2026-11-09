/**
 * Empêche un déploiement production avec APP_MODE=beta (quota illimité).
 * Le mode beta via cookie sur driveely.app reste autorisé — seules les env vars sont bloquées.
 */

function normalizeMode(raw: string | undefined): string | undefined {
  const v = raw?.trim().toLowerCase();
  if (v === "beta" || v === "production") return v;
  return undefined;
}

function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function envAppMode(): string | undefined {
  return (
    normalizeMode(process.env.DRIVEELY_APP_MODE) ??
    normalizeMode(process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE)
  );
}

export function assertProductionSafeConfig(): void {
  if (!isVercelProduction()) return;

  const mode = envAppMode();
  if (mode === "beta") {
    throw new Error(
      "[driveely] DÉPLOIEMENT BLOQUÉ : DRIVEELY_APP_MODE=beta (ou NEXT_PUBLIC_DRIVEELY_APP_MODE=beta) " +
        "est interdit quand VERCEL_ENV=production. Utilise production + cookie driveely_app_mode pour la bêta ciblée.",
    );
  }
}
