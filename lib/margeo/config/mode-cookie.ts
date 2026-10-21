/**
 * Cookie / header contract for Driveely UI app mode (single domain).
 * Presentation only (badge, feedback chrome). Never trust for billing /
 * quotas / entitlements — use getTrustedAppMode / getBillingFeatures.
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
