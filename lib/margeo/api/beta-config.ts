/** Configuration mode beta Uberly. */
export function isUberlyBetaMode(): boolean {
  return process.env.UBERLY_BETA_MODE === "true";
}

export function isBetaVerboseLogging(): boolean {
  return (
    isUberlyBetaMode() || process.env.NODE_ENV === "development"
  );
}

export function betaLog(
  scope: string,
  message: string,
  meta?: Record<string, unknown>,
) {
  if (!isBetaVerboseLogging()) return;
  console.info(`[uberly/beta:${scope}] ${message}`, meta ?? "");
}
