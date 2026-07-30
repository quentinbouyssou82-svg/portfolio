/**
 * Runtime environment — Driveely (single app, dual mode)
 *
 * Mode = cookie/session preference on driveely.app (not a second deployment).
 * Default (no cookie) = production/public.
 *
 * Env vars DRIVEELY_APP_MODE / NEXT_PUBLIC_* only set the *default* when no cookie.
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
 * Default when the user has not chosen a mode (no cookie).
 * Prefer production on the single domain; local override via env.
 */
export function getDefaultAppMode(): DriveelyAppMode {
  const fromPublic = normalizeMode(process.env.NEXT_PUBLIC_DRIVEELY_APP_MODE);
  if (fromPublic) return fromPublic;

  const fromServer = normalizeMode(process.env.DRIVEELY_APP_MODE);
  if (fromServer) return fromServer;

  if (
    process.env.DRIVEELY_BETA_MODE === "true" ||
    process.env.UBERLY_BETA_MODE === "true"
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
 * Sync resolver — safe for client components & middleware.
 * Client: cookie. Server without async context: default env (prefer async below).
 */
export function getAppMode(): DriveelyAppMode {
  const fromBrowser = normalizeMode(readBrowserCookie(DRIVEELY_APP_MODE_COOKIE));
  if (fromBrowser) return fromBrowser;
  return getDefaultAppMode();
}

/**
 * Server resolver — cookie + middleware header.
 * Use in Server Components, Route Handlers, Server Actions.
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
