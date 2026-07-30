/**
 * Cookie / header contract for Driveely app mode (single domain).
 * Beta is a runtime mode — not a second site.
 */

export const DRIVEELY_APP_MODE_COOKIE = "driveely_app_mode";
export const DRIVEELY_APP_MODE_HEADER = "x-driveely-app-mode";

/** Cookie lifetime: 180 days */
export const DRIVEELY_APP_MODE_MAX_AGE = 60 * 60 * 24 * 180;

export function appModeCookieOptions(isSecure: boolean) {
  return {
    httpOnly: false, // readable by client for UI badges / feature flags
    sameSite: "lax" as const,
    secure: isSecure,
    path: "/",
    maxAge: DRIVEELY_APP_MODE_MAX_AGE,
  };
}
