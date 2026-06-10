import { type NextRequest, NextResponse } from "next/server";
import {
  PIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/control-tower/pin-session";

const PREFIX = "/control-tower";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(PREFIX)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(PIN_SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(session);

  const isLogin = pathname === `${PREFIX}/login`;
  const isDashboard = pathname.startsWith(`${PREFIX}/dashboard`);

  if (!authenticated && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = `${PREFIX}/login`;
    return NextResponse.redirect(url);
  }

  if (authenticated && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `${PREFIX}/dashboard`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/control-tower/:path*"],
};
