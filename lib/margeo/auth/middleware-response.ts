import { type NextRequest, NextResponse } from "next/server";

/**
 * Copy Set-Cookie jar from a working middleware response onto a redirect.
 * Critical: supabase.auth.getUser() may refresh tokens onto `source`;
 * returning a brand-new NextResponse.redirect() without these cookies
 * drops the session mid-navigation → RSC "This page couldn't load".
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

  for (const cookie of source.cookies.getAll()) {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  }

  // Preserve Driveely mode headers when present
  const mode = source.headers.get("x-driveely-app-mode");
  if (mode) redirectResponse.headers.set("x-driveely-app-mode", mode);
  const hostMode = source.headers.get("x-driveely-host-mode");
  if (hostMode) {
    redirectResponse.headers.set("x-driveely-host-mode", hostMode);
  }

  return redirectResponse;
}
