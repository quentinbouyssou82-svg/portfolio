/**
 * Logging verbeux — distinct du mode app (beta vs production).
 * En APP_MODE=beta, le logging est actif ; sinon DRIVEELY_BETA_MODE=true pour debug.
 */

import { isBetaApp } from "@/lib/margeo/config";

/** @deprecated Préférer isBetaApp() pour le mode produit. Conservé pour logs. */
export function isDriveelyBetaMode(): boolean {
  return (
    isBetaApp() ||
    process.env.DRIVEELY_BETA_MODE === "true" ||
    process.env.UBERLY_BETA_MODE === "true"
  );
}

export function isBetaVerboseLogging(): boolean {
  return isDriveelyBetaMode() || process.env.NODE_ENV === "development";
}

export function betaLog(
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  if (!isBetaVerboseLogging()) return;
  console.info(`[driveely/beta:${scope}] ${message}`, meta ?? "");
}
