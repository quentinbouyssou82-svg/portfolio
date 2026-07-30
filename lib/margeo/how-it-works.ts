import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { DRIVEELY_BASE } from "@/lib/margeo/routes";

export const HOW_IT_WORKS_STORAGE_KEY = "driveely-how-it-works-seen";
export const HOW_IT_WORKS_COOKIE = "driveely_hiw_seen";
/** Max age ~400 days (Chrome caps persistent cookies). */
export const HOW_IT_WORKS_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

const ALLOWED_NEXT = new Set<string>([
  DRIVEELY_PATHS.onboarding,
  DRIVEELY_PATHS.dashboard,
  DRIVEELY_PATHS.analyse,
  DRIVEELY_PATHS.profil,
  DRIVEELY_PATHS.historique,
]);

/** Destinations relatives sûres après le tour. */
export function resolveHowItWorksNext(
  next: string | null | undefined,
  fallback: string = DRIVEELY_PATHS.onboarding,
): string {
  if (!next) return fallback;
  const decoded = (() => {
    try {
      return decodeURIComponent(next);
    } catch {
      return next;
    }
  })();
  if (ALLOWED_NEXT.has(decoded)) return decoded;
  // Accepte aussi les chemins relatifs sans préfixe démo
  const withoutBase = decoded.startsWith(DRIVEELY_BASE)
    ? decoded
    : `${DRIVEELY_BASE}${decoded.startsWith("/") ? decoded : `/${decoded}`}`.replace(
        /\/{2,}/g,
        "/",
      );
  if (ALLOWED_NEXT.has(withoutBase)) return withoutBase;
  return fallback;
}

export function buildHowItWorksPath(next: string): string {
  const safe = resolveHowItWorksNext(next);
  const base = DRIVEELY_PATHS.howItWorks;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}next=${encodeURIComponent(safe)}`;
}

export function howItWorksCookieOptions(isSecure: boolean) {
  return {
    // Readable by client gate / tour (mirrors localStorage).
    httpOnly: false,
    sameSite: "lax" as const,
    secure: isSecure,
    path: "/",
    maxAge: HOW_IT_WORKS_COOKIE_MAX_AGE,
  };
}

/** Strict cookie value check (avoids prefix false-positives). */
export function isHowItWorksCookieValue(
  value: string | null | undefined,
): boolean {
  return value === "1";
}

export function hasSeenHowItWorksClient(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(HOW_IT_WORKS_STORAGE_KEY) === "1") return true;
    return document.cookie.split(";").some((c) => {
      const part = c.trim();
      return part === `${HOW_IT_WORKS_COOKIE}=1`;
    });
  } catch {
    return false;
  }
}

export function markHowItWorksSeenClient(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOW_IT_WORKS_STORAGE_KEY, "1");
  } catch {
    // private mode
  }
  try {
    const secure =
      typeof location !== "undefined" && location.protocol === "https:";
    const parts = [
      `${HOW_IT_WORKS_COOKIE}=1`,
      "path=/",
      `max-age=${HOW_IT_WORKS_COOKIE_MAX_AGE}`,
      "SameSite=Lax",
    ];
    if (secure) parts.push("Secure");
    document.cookie = parts.join("; ");
  } catch {
    // ignore
  }
}

export function howItWorksCookieSeen(
  cookieHeader: string | null | undefined,
): boolean {
  if (!cookieHeader) return false;
  return cookieHeader
    .split(";")
    .some((c) => c.trim() === `${HOW_IT_WORKS_COOKIE}=1`);
}
