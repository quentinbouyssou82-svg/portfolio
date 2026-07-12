import { type NextRequest, NextResponse } from "next/server";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { createMargeoRouteHandlerClient } from "@/lib/margeo/supabase/route-handler";

/** Déconnexion Supabase — route GET (lien direct ou bookmark). */
export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const response = NextResponse.redirect(new URL(UBERLY_PATHS.login, origin));

  try {
    const supabase = createMargeoRouteHandlerClient(request, response);
    await supabase.auth.signOut();
  } catch {
    // Session déjà absente — on redirige quand même.
  }

  return response;
}
