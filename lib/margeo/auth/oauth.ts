"use server";

import { redirect } from "next/navigation";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { uberlyRoutes } from "@/lib/margeo/routes";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import type { MargeoActionResult } from "./actions";

export async function signInWithGoogleAction(): Promise<void> {
  const supabase = await createMargeoServerClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}${uberlyRoutes.authCallback}`,
    },
  });

  if (error) throw new Error(error.message);
  if (data.url) redirect(data.url);
}

export async function resetPasswordAction(
  formData: FormData,
): Promise<MargeoActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { ok: false, message: "Email requis." };
  }

  const supabase = await createMargeoServerClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}${UBERLY_PATHS.login}?reset=1`,
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
