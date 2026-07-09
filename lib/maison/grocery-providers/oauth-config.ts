import type { GroceryProviderId } from "@/lib/maison/grocery-providers/config";

export interface ProviderOAuthEnv {
  clientId?: string;
  clientSecret?: string;
  authorizeUrl: string;
  tokenUrl?: string;
  scope?: string;
  returnUrlParam: string;
}

export function getMaisonAppOrigin(): string {
  const explicit = process.env.MAISON_APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

function envKey(provider: GroceryProviderId, suffix: string): string {
  const prefix = provider === "leclerc_drive" ? "MAISON_LECLERC" : "MAISON_NETTO";
  return `${prefix}_OAUTH_${suffix}`;
}

export function getProviderOAuthEnv(provider: GroceryProviderId): ProviderOAuthEnv {
  if (provider === "leclerc_drive") {
    return {
      clientId: process.env[envKey(provider, "CLIENT_ID")]?.trim(),
      clientSecret: process.env[envKey(provider, "CLIENT_SECRET")]?.trim(),
      authorizeUrl:
        process.env[envKey(provider, "AUTHORIZE_URL")]?.trim() ??
        "https://www.e.leclerc/auth",
      tokenUrl: process.env[envKey(provider, "TOKEN_URL")]?.trim(),
      scope: process.env[envKey(provider, "SCOPE")]?.trim() ?? "openid profile drive",
      returnUrlParam:
        process.env[envKey(provider, "RETURN_URL_PARAM")]?.trim() ?? "returnUrl",
    };
  }

  if (provider === "netto") {
    return {
      clientId: process.env[envKey(provider, "CLIENT_ID")]?.trim(),
      clientSecret: process.env[envKey(provider, "CLIENT_SECRET")]?.trim(),
      authorizeUrl:
        process.env[envKey(provider, "AUTHORIZE_URL")]?.trim() ??
        "https://www.netto.fr",
      tokenUrl: process.env[envKey(provider, "TOKEN_URL")]?.trim(),
      scope: process.env[envKey(provider, "SCOPE")]?.trim(),
      returnUrlParam: "returnUrl",
    };
  }

  return {
    authorizeUrl: "",
    returnUrlParam: "returnUrl",
  };
}

/** OAuth partenaire configuré (client_id + token URL) */
export function isProviderOAuthConfigured(provider: GroceryProviderId): boolean {
  if (provider === "other") return false;
  const env = getProviderOAuthEnv(provider);
  return Boolean(env.clientId && env.tokenUrl);
}

/** Redirection vers la page de connexion enseigne (OAuth ou retour externe) */
export function supportsProviderOAuthRedirect(provider: GroceryProviderId): boolean {
  return provider === "leclerc_drive" || provider === "netto";
}

export function getOAuthCallbackUrl(origin?: string): string {
  const base = origin ?? getMaisonAppOrigin();
  return `${base}/api/maison/grocery/oauth/callback`;
}

export function getOAuthReturnPageUrl(state: string, origin?: string): string {
  const base = origin ?? getMaisonAppOrigin();
  return `${base}/demos/maison/connexion-courses/retour?state=${encodeURIComponent(state)}`;
}
