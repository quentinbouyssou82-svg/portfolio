import { MAISON_PATHS } from "@/lib/maison/constants";
import {
  getOAuthCallbackUrl,
  getOAuthReturnPageUrl,
  getProviderOAuthEnv,
  isProviderOAuthConfigured,
  supportsProviderOAuthRedirect,
} from "@/lib/maison/grocery-providers/oauth-config";
import {
  createGroceryOAuthStateToken,
  parseGroceryOAuthStateToken,
  type GroceryOAuthStatePayload,
} from "@/lib/maison/grocery-providers/oauth-state";
import { connectGroceryProvider } from "@/lib/maison/grocery-providers/service";
import { saveOAuthTokens } from "@/lib/maison/grocery-providers/credentials";
import { GROCERY_PROVIDERS, type GroceryProviderId } from "@/lib/maison/grocery-providers/config";
import type { GroceryIntegration } from "@/lib/maison/types";

export class GroceryOAuthError extends Error {
  constructor(
    message: string,
    readonly code: "unsupported" | "invalid_state" | "token_exchange" | "forbidden" = "unsupported",
  ) {
    super(message);
    this.name = "GroceryOAuthError";
  }
}

export async function buildGroceryOAuthAuthorizeUrl(input: {
  householdId: string;
  memberId: string;
  provider: GroceryProviderId;
  storeId?: string;
  returnPath?: string;
  origin?: string;
}): Promise<string> {
  if (!supportsProviderOAuthRedirect(input.provider)) {
    throw new GroceryOAuthError("Cette enseigne ne supporte pas la connexion OAuth.", "unsupported");
  }

  const oauthEnv = getProviderOAuthEnv(input.provider);
  const mode = isProviderOAuthConfigured(input.provider) ? "oauth" : "external";
  const returnPath = input.returnPath ?? MAISON_PATHS.connexionCourses;

  const state = await createGroceryOAuthStateToken({
    householdId: input.householdId,
    memberId: input.memberId,
    provider: input.provider,
    storeId: input.storeId,
    returnPath,
    mode,
  });

  const callbackUrl =
    mode === "oauth"
      ? getOAuthCallbackUrl(input.origin)
      : getOAuthReturnPageUrl(state, input.origin);

  const url = new URL(oauthEnv.authorizeUrl);

  if (mode === "oauth" && oauthEnv.clientId) {
    url.searchParams.set("client_id", oauthEnv.clientId);
    url.searchParams.set("redirect_uri", callbackUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    if (oauthEnv.scope) url.searchParams.set("scope", oauthEnv.scope);
  } else {
    url.searchParams.set(oauthEnv.returnUrlParam, callbackUrl);
    if (input.storeId) url.searchParams.set("storeId", input.storeId);
  }

  return url.toString();
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  sub?: string;
}

async function exchangeAuthorizationCode(
  provider: GroceryProviderId,
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const env = getProviderOAuthEnv(provider);
  if (!env.clientId || !env.clientSecret || !env.tokenUrl) {
    throw new GroceryOAuthError("OAuth partenaire non configuré.", "token_exchange");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: env.clientId,
    client_secret: env.clientSecret,
  });

  const res = await fetch(env.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new GroceryOAuthError(
      `Échange token échoué (${res.status})${text ? ` : ${text.slice(0, 120)}` : ""}`,
      "token_exchange",
    );
  }

  return (await res.json()) as TokenResponse;
}

async function finalizeConnection(
  state: GroceryOAuthStatePayload,
  accountLabel?: string,
): Promise<GroceryIntegration> {
  const config = GROCERY_PROVIDERS[state.provider];

  const integration: GroceryIntegration = {
    provider: state.provider,
    status: "connected",
    storeId: state.storeId ?? config.defaultStoreId,
    connectedAt: new Date().toISOString(),
    accountLabel: accountLabel ?? `Compte ${config.label}`,
    oauthMode: state.mode,
  };

  const household = await import("@/lib/maison/services/households").then((m) =>
    m.getHousehold(state.householdId),
  );
  const prev = household?.global_settings ?? {};

  await import("@/lib/maison/services/households").then((m) =>
    m.updateHousehold(state.householdId, {
      global_settings: {
        ...prev,
        grocery_provider: integration,
      },
    }),
  );

  return integration;
}

export async function handleGroceryOAuthCallback(input: {
  code?: string | null;
  state?: string | null;
  error?: string | null;
  origin?: string;
}): Promise<{ integration: GroceryIntegration; returnPath: string }> {
  if (input.error) {
    throw new GroceryOAuthError(`Connexion refusée : ${input.error}`, "forbidden");
  }

  const state = await parseGroceryOAuthStateToken(input.state);
  if (!state) {
    throw new GroceryOAuthError("Session OAuth expirée ou invalide. Recommencez la connexion.", "invalid_state");
  }

  if (state.mode === "oauth" && input.code) {
    const tokens = await exchangeAuthorizationCode(
      state.provider,
      input.code,
      getOAuthCallbackUrl(input.origin),
    );

    await saveOAuthTokens(state.householdId, state.provider, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      externalAccountId: tokens.sub,
    });

    const integration = await finalizeConnection(
      state,
      `Compte ${GROCERY_PROVIDERS[state.provider].shortLabel} connecté`,
    );
    return { integration, returnPath: state.returnPath };
  }

  throw new GroceryOAuthError("Code OAuth manquant.", "token_exchange");
}

/** Confirmation après retour depuis la page de connexion e.Leclerc (sans API partenaire) */
export async function confirmGroceryExternalLogin(
  stateToken: string,
  accountLabel?: string,
): Promise<{ integration: GroceryIntegration; returnPath: string }> {
  const state = await parseGroceryOAuthStateToken(stateToken);
  if (!state) {
    throw new GroceryOAuthError("Session expirée. Recommencez la connexion.", "invalid_state");
  }

  if (state.mode === "oauth" && isProviderOAuthConfigured(state.provider)) {
    throw new GroceryOAuthError(
      "Utilisez le flux OAuth complet (redirection automatique).",
      "invalid_state",
    );
  }

  const integration = await finalizeConnection(
    state,
    accountLabel ?? `Compte ${GROCERY_PROVIDERS[state.provider].label}`,
  );
  return { integration, returnPath: state.returnPath };
}
