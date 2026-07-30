"use server";

import { cookies } from "next/headers";
import {
  DRIVEELY_APP_MODE_COOKIE,
  appModeCookieOptions,
  getAppModeAsync,
  normalizeMode,
  type DriveelyAppMode,
} from "@/lib/margeo/config";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { markBetaTester } from "@/lib/margeo/services/beta-user";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";

export type BetaModeResult =
  | { ok: true; mode: DriveelyAppMode; redirectTo?: string }
  | { ok: false; message: string };

async function setModeCookie(mode: DriveelyAppMode) {
  const jar = await cookies();
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1";
  jar.set(DRIVEELY_APP_MODE_COOKIE, mode, appModeCookieOptions(secure));
}

/**
 * Active le mode Bêta (cookie). Optionnellement marque le profil connecté.
 * Appelé depuis « Rejoindre la bêta » — avant ou après auth.
 */
export async function joinBetaAction(input?: {
  redirectToLogin?: boolean;
}): Promise<BetaModeResult> {
  await setModeCookie("beta");

  try {
    const supabase = await createMargeoServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await markBetaTester(user.id, { force: true });
      await logBetaEvent({
        userId: user.id,
        eventType: "beta_joined",
        metadata: { source: "join_beta_action" },
      });
      return {
        ok: true,
        mode: "beta",
        redirectTo: DRIVEELY_PATHS.dashboard,
      };
    }
  } catch {
    // cookie already set
  }

  return {
    ok: true,
    mode: "beta",
    redirectTo: input?.redirectToLogin
      ? `${DRIVEELY_PATHS.login}?mode=signup&beta=1`
      : undefined,
  };
}

/** Repasse en mode public/officiel (cookie). */
export async function leaveBetaAction(): Promise<BetaModeResult> {
  await setModeCookie("production");
  return { ok: true, mode: "production" };
}

export async function getCurrentAppModeAction(): Promise<DriveelyAppMode> {
  return getAppModeAsync();
}

/** Utilitaire serveur : force un mode explicite (tests / admin). */
export async function setAppModeAction(
  modeRaw: string,
): Promise<BetaModeResult> {
  const mode = normalizeMode(modeRaw);
  if (!mode) return { ok: false, message: "Mode invalide." };
  await setModeCookie(mode);
  return { ok: true, mode };
}
