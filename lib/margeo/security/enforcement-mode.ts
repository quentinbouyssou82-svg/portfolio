/**
 * Modes d'application des garde-fous sécurité.
 * - log_only : observe et journalise sans bloquer (déploiement progressif)
 * - strict   : bloque les requêtes non conformes
 */

export type SecurityEnforcementMode = "log_only" | "strict";

export function parseEnforcementMode(
  raw: string | undefined,
  fallback: SecurityEnforcementMode = "log_only",
): SecurityEnforcementMode {
  const v = raw?.trim().toLowerCase();
  if (v === "strict" || v === "block") return "strict";
  if (v === "log_only" || v === "log-only" || v === "observe") return "log_only";
  return fallback;
}
