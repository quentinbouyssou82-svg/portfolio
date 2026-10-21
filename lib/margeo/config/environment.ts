/**
 * Runtime environment — Driveely (single app, dual mode)
 *
 * UI mode (cookie / X-Driveely-App-Mode) = badges, feedback chrome, marketing copy.
 * Trusted mode (env only) = billing, quotas, entitlements, premium unlock.
 *
 * Never derive commercial entitlements from cookie or client spoof headers.
 */

import {
  DRIVEELY_APP_MODE_COOKIE,
  DRIVEELY_APP_MODE_HEADER,
} from "./mode-cookie";

export type DriveelyAppMode = "production" | "beta";

/** Alias produit : « public » = production */
export type DriveelyAppModeAlias = DriveelyAppMode | "public";

export function normalizeMode(
  raw: string | undefined | null,
): DriveelyAppMode | null {
  const v = raw?.trim().toLowerCase();
  if (v === "beta") return "beta";
  if (v === "production" || v === "public" || v === "official") {
    return "production";
  }
  return null;
}

/**
 * Server-trusted mode — env only. Never cookie / never client header.
 * Use for billing, quotas, entitlements, OCR fail-closed, production gates.
 */
export function getTrustedAppMode(): DriveelyAppMode {
  return getDefaultAppMode();
}

/**
 * Default when the user has not chosen a UI mode (no cookie).
 * Prefer production on the single domain; local override via env.
 * Sur Vercel production : ignore DRIVEELY_BETA_MODE / UBERLY_BETA_MODE
 * (legacy flags that would unlock Elite for everyone).
 */
export function getDefaultAppMode(): DriveelyAppMode {
  const fromPublic = normalizeMode(process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE);
  if (fromPublic) return fromPublic;

  const fromServer = normalizeMode(process.env.DRIVEELY_APP_MODE);
  if (fromServer) return fromServer;

  const onVercelProduction = process.env.VERCEL_ENV === "production";
  if (
    !onVercelProduction &&
    (process.env.DRIVEELY_BETA_MODE === "true" ||
      process.env.UBERLY_BETA_MODE === "true")
  ) {
    return "beta";
  }

  return "production";
}

function readBrowserCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

/**
 * Sync UI mode — client cookie or env default.
 * Do NOT use for quotas / billing / entitlements (use getTrustedAppMode).
 */
export function getAppMode(): DriveelyAppMode {
  const fromBrowser = normalizeMode(readBrowserCookie(DRIVEELY_APP_MODE_COOKIE));
  if (fromBrowser) return fromBrowser;
  return getDefaultAppMode();
}

/**
 * Async UI mode — cookie + middleware header (presentation only).
 * Do NOT use for quotas / billing / entitlements (use getTrustedAppMode).
 */
export async function getAppModeAsync(): Promise<DriveelyAppMode> {
  try {
    const { cookies, headers } = await import("next/headers");
    const h = await headers();
    const fromHeader = normalizeMode(h.get(DRIVEELY_APP_MODE_HEADER));
    if (fromHeader) return fromHeader;

    const jar = await cookies();
    const fromCookie = normalizeMode(jar.get(DRIVEELY_APP_MODE_COOKIE)?.value);
    if (fromCookie) return fromCookie;
  } catch {
    // Outside Next request (scripts / build)
  }
  return getDefaultAppMode();
}

export function isBetaApp(): boolean {
  return getAppMode() === "beta";
}

export function isProductionApp(): boolean {
  return getAppMode() === "production";
}

export async function isBetaAppAsync(): Promise<boolean> {
  return (await getAppModeAsync()) === "beta";
}

/** Trusted (env) beta — never from client spoof. */
export function isTrustedBetaApp(): boolean {
  return getTrustedAppMode() === "beta";
}

export function isTrustedProductionApp(): boolean {
  return getTrustedAppMode() === "production";
}
