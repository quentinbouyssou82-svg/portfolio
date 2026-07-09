"use server";

import { redirect } from "next/navigation";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { markBetaTester } from "@/lib/margeo/services/beta-user";

export type MargeoActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; message: string };

export async function signUpAction(formData: FormData): Promise<MargeoActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password) {
    return { ok: false, message: "Email et mot de passe requis." };
  }
  if (password.length < 6) {
    return { ok: false, message: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  try {
    const supabase = await createMargeoServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    if (data.user?.id) {
      await markBetaTester(data.user.id);
      await logBetaEvent({
        userId: data.user.id,
        eventType: "account_created",
        metadata: { method: "email", emailDomain: email.split("@")[1] },
      });
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Impossible de créer le compte.",
    };
  }
}

export async function signInAction(formData: FormData): Promise<MargeoActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Email et mot de passe requis." };
  }

  try {
    const supabase = await createMargeoServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { ok: false, message: error.message };
    }

    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Connexion impossible.",
    };
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createMargeoServerClient();
  await supabase.auth.signOut();
  redirect(UBERLY_PATHS.home);
}
