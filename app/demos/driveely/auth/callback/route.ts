import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { getPostAuthPath } from "@/lib/margeo/auth/post-auth";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "@/lib/margeo/supabase/env";
import { markBetaTester } from "@/lib/margeo/services/beta-user";
import {
  DRIVEELY_APP_MODE_COOKIE,
  normalizeMode,
} from "@/lib/margeo/config";

/**
 * OAuth / magic-link callback.
 * Public URL: /auth/callback (rewritten to /demos/driveely/auth/callback).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  const url = getMargeoSupabaseUrl();
  const key = getMargeoClientKey();

  if (!url || !key) {
    return NextResponse.redirect(`${origin}${DRIVEELY_PATHS.login}?error=config`);
  }

  const redirectBase = new URL(origin);

  if (code) {
    const response = NextResponse.redirect(redirectBase);
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const mode = normalizeMode(
        request.cookies.get(DRIVEELY_APP_MODE_COOKIE)?.value,
      );
      if (mode === "beta") {
        await markBetaTester(data.user.id, { force: true });
      }

      const path =
        next && next.startsWith("/")
          ? next
          : await getPostAuthPath(data.user.id);
      response.headers.set("Location", `${origin}${path}`);
      return response;
    }
  }

  return NextResponse.redirect(
    `${origin}${DRIVEELY_PATHS.login}?error=auth_callback`,
  );
}
