import { NextResponse } from "next/server";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { markBetaTester } from "@/lib/margeo/services/beta-user";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createMargeoServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("margeo_profiles")
        .select("onboarding_completed, created_at")
        .eq("id", user.id)
        .maybeSingle();

      const isNewUser =
        profile?.created_at &&
        Date.now() - new Date(profile.created_at).getTime() < 120_000;

      if (isNewUser) {
        await markBetaTester(user.id);
        await logBetaEvent({
          userId: user.id,
          eventType: "account_created",
          metadata: { method: "google" },
        });
      }

      const dest = profile?.onboarding_completed
        ? UBERLY_PATHS.dashboard
        : UBERLY_PATHS.onboarding;
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}${UBERLY_PATHS.login}`);
}
