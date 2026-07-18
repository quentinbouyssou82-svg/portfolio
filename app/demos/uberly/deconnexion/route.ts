import { type NextRequest, NextResponse } from "next/server";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { createMargeoRouteHandlerClient } from "@/lib/margeo/supabase/route-handler";

/** Déconnexion Supabase — route GET. Cookies nettoyés via la response. */
export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const loginUrl = new URL(UBERLY_PATHS.login, origin);
  loginUrl.searchParams.set("loggedOut", "1");
  const response = NextResponse.redirect(loginUrl);

  try {
    const supabase = createMargeoRouteHandlerClient(request, response);
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    // Session déjà absente — on redirige quand même.
  }

  for (const cookie of request.cookies.getAll()) {
    if (
      cookie.name.includes("auth-token") ||
      cookie.name.startsWith("sb-") ||
      cookie.name.includes("supabase")
    ) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }

  return response;
}
