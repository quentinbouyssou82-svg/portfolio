import { type NextRequest, NextResponse } from "next/server";

/**
 * Copy Set-Cookie jar from a working middleware response onto a redirect.
 * Critical: supabase.auth.getUser() may refresh tokens onto `source`;
 * returning a brand-new NextResponse.redirect() without these cookies
 * drops the session mid-navigation → RSC "This page couldn't load".
 *
 * Prefer raw Set-Cookie header lines so Path / Secure / HttpOnly / Max-Age /
 * SameSite survive. `cookies.getAll()` only exposes name+value and would
 * rewrite refreshed JWTs as attribute-less cookies → intermittent auth loss.
 */
export function redirectPreservingCookies(
  request: NextRequest,
  source: NextResponse,
  pathname: string,
  search: string = "",
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search;
  const redirectResponse = NextResponse.redirect(url);

  const setCookieLines =
    typeof source.headers.getSetCookie === "function"
      ? source.headers.getSetCookie()
      : [];

  if (setCookieLines.length > 0) {
    for (const line of setCookieLines) {
      redirectResponse.headers.append("Set-Cookie", line);
    }
  } else {
    for (const cookie of source.cookies.getAll()) {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    }
  }

  // Preserve Driveely mode headers when present
  const mode = source.headers.get("x-driveely-app-mode");
  if (mode) redirectResponse.headers.set("x-driveely-app-mode", mode);
  const hostMode = source.headers.get("x-driveely-host-mode");
  if (hostMode) {
    redirectResponse.headers.set("x-driveely-host-mode", hostMode);
  }
  const hiwDebug = source.headers.get("x-hiw-debug");
  if (hiwDebug) {
    redirectResponse.headers.set("x-hiw-debug", hiwDebug);
  }

  return redirectResponse;
}
