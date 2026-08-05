"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { getMargeoAdminDb } from "@/lib/margeo/supabase/admin";
import { getMargeoServiceKey } from "@/lib/margeo/supabase/env";
import { getAppModeAsync } from "@/lib/margeo/config";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { markBetaTester } from "@/lib/margeo/services/beta-user";
import { resolveAuthError, type AuthErrorLike } from "./errors";
import { getPostAuthPath } from "./post-auth";

export type MargeoActionResult<T = void> =
  | { ok: true; data?: T; redirectTo?: string }
  | { ok: false; message: string };

/** Bêta : confirme l'email via service role si Supabase exige encore la confirmation. */
async function confirmUserEmail(userId: string): Promise<boolean> {
  try {
    const admin = getMargeoAdminDb();
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    return !error;
  } catch {
    return false;
  }
}

/** Répare un compte créé lors d'une tentative précédente (non confirmé / jamais connecté). */
async function repairUserForSignup(
  userId: string,
  password: string,
  name: string,
  termsAcceptedAt?: string,
): Promise<void> {
  try {
    const admin = getMargeoAdminDb();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) return;

    const user = data.user;
    const needsPasswordSync =
      !user.email_confirmed_at || !user.last_sign_in_at;
    const prev =
      typeof user.user_metadata === "object" && user.user_metadata
        ? user.user_metadata
        : {};

    await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
      ...(needsPasswordSync ? { password } : {}),
      user_metadata: {
        ...prev,
        name: name || (prev as { name?: string }).name || "",
        ...(termsAcceptedAt
          ? {
              terms_accepted_at: termsAcceptedAt,
              terms_version: "cgu-privacy-v1",
            }
          : {}),
      },
    });
  } catch {
    // best-effort
  }
}

async function establishSessionAfterSignUp(
  supabase: SupabaseClient,
  email: string,
  password: string,
  userId: string,
  name = "",
  termsAcceptedAt?: string,
): Promise<User | null> {
  await repairUserForSignup(userId, password, name, termsAcceptedAt);
  await confirmUserEmail(userId);

  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user && data.session) {
      return data.user;
    }

    if (error?.message?.toLowerCase().includes("invalid login credentials")) {
      break;
    }

    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      await confirmUserEmail(userId);
    }
  }

  return null;
}

function isSignupRateLimit(error: AuthErrorLike): boolean {
  const code = error.code?.toLowerCase();
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit") {
    return true;
  }
  return (
    error.status === 429 ||
    Boolean(error.message?.toLowerCase().includes("rate limit"))
  );
}

/** Bêta : création admin si le signup public est bloqué (rate limit email Supabase). */
async function adminCreateUser(
  email: string,
  password: string,
  name: string,
  termsAcceptedAt: string,
): Promise<string> {
  const admin = getMargeoAdminDb();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      terms_accepted_at: termsAcceptedAt,
      terms_version: "cgu-privacy-v1",
    },
  });
  if (error) throw error;
  if (!data.user?.id) throw new Error("admin_create_user_failed");
  await repairUserForSignup(data.user.id, password, name, termsAcceptedAt);
  return data.user.id;
}

async function finalizeSignUpAndRedirect(
  user: User,
  name: string,
  termsAcceptedAt?: string,
): Promise<MargeoActionResult> {
  if ((await getAppModeAsync()) === "beta") {
    await markBetaTester(user.id, { force: true });
  }
  if (termsAcceptedAt) {
    try {
      const admin = getMargeoAdminDb();
      await admin
        .from("margeo_profiles")
        .update({
          terms_accepted_at: termsAcceptedAt,
          terms_version: "cgu-privacy-v1",
        })
        .eq("id", user.id);
    } catch {
      // colonne optionnelle tant que la migration n'est pas appliquée
    }
  }
  await logBetaEvent({
    userId: user.id,
    eventType: "account_created",
    metadata: {
      method: "email",
      emailDomain: (user.email ?? "").split("@")[1],
      ...(termsAcceptedAt ? { terms_accepted_at: termsAcceptedAt } : {}),
    },
  });
  return {
    ok: true,
    redirectTo: await getPostAuthPath(user.id, name).catch(() =>
      DRIVEELY_PATHS.dashboard,
    ),
  };
}

/** Bêta : création via admin API (pas d'email envoyé → pas de rate limit). */
async function signUpWithAdminApi(
  supabase: SupabaseClient,
  email: string,
  password: string,
  name: string,
  termsAcceptedAt: string,
): Promise<MargeoActionResult> {
  let userId: string;
  try {
    userId = await adminCreateUser(email, password, name, termsAcceptedAt);
  } catch (adminErr) {
    const msg = adminErr instanceof Error ? adminErr.message.toLowerCase() : "";
    if (msg.includes("already") || msg.includes("exists")) {
      const existingId = await findUserIdByEmail(email);
      if (!existingId) {
        return { ok: false, message: "Un compte existe déjà avec cet email." };
      }
      userId = existingId;
      await repairUserForSignup(existingId, password, name, termsAcceptedAt);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.error("[driveely/auth] admin signup failed:", adminErr);
      }
      return {
        ok: false,
        message: "Inscription temporairement indisponible. Réessaie dans quelques minutes.",
      };
    }
  }

  const user = await establishSessionAfterSignUp(
    supabase,
    email,
    password,
    userId,
    name,
    termsAcceptedAt,
  );
  if (!user) {
    const existing = await findUserIdByEmail(email);
    if (existing) {
      return {
        ok: false,
        message:
          "Un compte existe déjà avec cet email. Connecte-toi ou utilise « Mot de passe oublié ».",
      };
    }
    return {
      ok: false,
      message: "Compte créé mais connexion impossible. Réessaie de te connecter.",
    };
  }

  return finalizeSignUpAndRedirect(user, name, termsAcceptedAt);
}

export async function signUpAction(
  _prev: MargeoActionResult | undefined,
  formData: FormData,
): Promise<MargeoActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const acceptTerms = formData.get("acceptTerms");

  if (!email || !password) {
    return { ok: false, message: "Email et mot de passe requis." };
  }
  if (password.length < 6) {
    return { ok: false, message: "Le mot de passe doit contenir au moins 6 caractères." };
  }
  if (acceptTerms !== "1" && acceptTerms !== "on") {
    return {
      ok: false,
      message:
        "Tu dois accepter les Conditions Générales d'Utilisation et la Politique de confidentialité.",
    };
  }

  const termsAcceptedAt = new Date().toISOString();

  try {
    const supabase = await createMargeoServerClient();

    // Bêta : priorité admin API (évite rate limit email Supabase ~2/h sans SMTP custom).
    if (getMargeoServiceKey()) {
      return await signUpWithAdminApi(
        supabase,
        email,
        password,
        name,
        termsAcceptedAt,
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          terms_accepted_at: termsAcceptedAt,
          terms_version: "cgu-privacy-v1",
        },
      },
    });

    if (error) {
      const authError: AuthErrorLike = {
        message: error.message,
        code: "code" in error ? String(error.code) : undefined,
        status: "status" in error ? Number(error.status) : undefined,
      };

      if (isSignupRateLimit(authError)) {
        return {
          ok: false,
          message:
            "Inscriptions temporairement limitées. Contacte l'équipe ou réessaie plus tard.",
        };
      }

      return {
        ok: false,
        message: resolveAuthError(authError),
      };
    }

    let user = data.user;

    if (!data.session && user) {
      user = await establishSessionAfterSignUp(
        supabase,
        email,
        password,
        user.id,
        name,
        termsAcceptedAt,
      );
    } else if (data.session) {
      user = data.user;
    }

    if (!user) {
      return {
        ok: false,
        message: "Compte créé mais connexion impossible. Réessaie de te connecter.",
      };
    }

    return finalizeSignUpAndRedirect(user, name, termsAcceptedAt);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      ok: false,
      message: resolveAuthError(
        e instanceof Error ? e.message : "Impossible de créer le compte.",
      ),
    };
  }
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  try {
    const admin = getMargeoAdminDb();
    for (let page = 1; page <= 5; page++) {
      const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      const match = data.users.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase(),
      );
      if (match) return match.id;
      if (data.users.length < 200) break;
    }
  } catch {
    // ignore
  }
  return null;
}

export async function signInAction(
  _prev: MargeoActionResult | undefined,
  formData: FormData,
): Promise<MargeoActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Email et mot de passe requis." };
  }

  try {
    const supabase = await createMargeoServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const isUnconfirmed = error.message?.toLowerCase().includes("email not confirmed");
      if (isUnconfirmed) {
        const userId = await findUserIdByEmail(email);
        if (userId && (await confirmUserEmail(userId))) {
          const retry = await supabase.auth.signInWithPassword({ email, password });
          if (retry.data.user && retry.data.session) {
            const name =
              retry.data.user.user_metadata?.name as string | undefined;
            try {
              return {
                ok: true,
                redirectTo: await getPostAuthPath(retry.data.user.id, name),
              };
            } catch {
              return { ok: true, redirectTo: DRIVEELY_PATHS.dashboard };
            }
          }
        }
      }

      return {
        ok: false,
        message: resolveAuthError({
          message: error.message,
          code: "code" in error ? String(error.code) : undefined,
          status: "status" in error ? Number(error.status) : undefined,
        }),
      };
    }

    if (!data.user) {
      return { ok: false, message: "Connexion impossible." };
    }

    // Session cookies are already set. Never fail the action for a
    // transient post-auth path/profile race — the continuing gate waits.
    const name = data.user.user_metadata?.name as string | undefined;
    try {
      const redirectTo = await getPostAuthPath(data.user.id, name);
      return { ok: true, redirectTo };
    } catch (pathErr) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[driveely/auth] getPostAuthPath after sign-in:", pathErr);
      }
      return { ok: true, redirectTo: DRIVEELY_PATHS.dashboard };
    }
  } catch (e) {
    if (isRedirectError(e)) throw e;
    return {
      ok: false,
      message: resolveAuthError(
        e instanceof Error ? e.message : "Connexion impossible.",
      ),
    };
  }
}

export async function signOutAction(): Promise<{ ok: true; redirectTo: string }> {
  try {
    const supabase = await createMargeoServerClient();
    await supabase.auth.signOut();
  } catch {
    // Déjà déconnecté
  }
  return { ok: true, redirectTo: DRIVEELY_PATHS.login };
}
