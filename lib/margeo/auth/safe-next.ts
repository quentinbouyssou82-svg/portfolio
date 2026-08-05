import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { DRIVEELY_BASE } from "@/lib/margeo/routes";

const ALLOWED_EXACT = new Set<string>([
  DRIVEELY_PATHS.dashboard,
  DRIVEELY_PATHS.onboarding,
  DRIVEELY_PATHS.analyse,
  DRIVEELY_PATHS.profil,
  DRIVEELY_PATHS.historique,
  DRIVEELY_PATHS.premium,
  DRIVEELY_PATHS.subscription,
  DRIVEELY_PATHS.howItWorks,
]);

/**
 * Only allow same-origin relative Driveely destinations after auth.
 * Rejects open redirects (//evil, https://…, javascript:, etc.).
 */
export function resolveSafePostAuthNext(
  next: string | null | undefined,
  fallback: string = DRIVEELY_PATHS.dashboard,
): string {
  if (!next) return fallback;
  let decoded = next.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }

  if (
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("://") ||
    decoded.includes("\\")
  ) {
    return fallback;
  }

  const pathOnly = decoded.split("?")[0]?.split("#")[0] ?? decoded;
  if (ALLOWED_EXACT.has(pathOnly)) return decoded;

  // Allow /historique/:id and demo-prefixed equivalents already in ALLOWED
  if (
    pathOnly.startsWith(`${DRIVEELY_PATHS.historique}/`) ||
    pathOnly.startsWith("/historique/")
  ) {
    return decoded;
  }

  if (DRIVEELY_BASE && pathOnly.startsWith(`${DRIVEELY_BASE}/`)) {
    const rel = pathOnly.slice(DRIVEELY_BASE.length) || "/";
    if (
      ALLOWED_EXACT.has(pathOnly) ||
      ALLOWED_EXACT.has(rel) ||
      rel.startsWith("/historique/")
    ) {
      return decoded;
    }
  }

  return fallback;
}
