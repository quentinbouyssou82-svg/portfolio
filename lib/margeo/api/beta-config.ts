/** Configuration mode beta Driveely. */
export function isDriveelyBetaMode(): boolean {
  return (
    process.env.DRIVEELY_BETA_MODE === "true" ||
    process.env.UBERLY_BETA_MODE === "true"
  );
}

export function isBetaVerboseLogging(): boolean {
  return (
    isDriveelyBetaMode() || process.env.NODE_ENV === "development"
  );
}

export function betaLog(
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  if (!isBetaVerboseLogging()) return;
  console.info(`[driveely/beta:${scope}] ${message}`, meta ?? "");
}
