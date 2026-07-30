import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import {
  PIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/control-tower/pin-session";
import {
  DRIVEELY_PATHS,
  PUBLIC_DRIVEELY_PATHS,
  PROTECTED_DRIVEELY_PREFIXES,
} from "@/lib/margeo/constants";
import {
  DRIVEELY_APP_MODE_COOKIE,
  DRIVEELY_APP_MODE_HEADER,
  appModeCookieOptions,
  getDefaultAppMode,
  normalizeMode,
  type DriveelyAppMode,
} from "@/lib/margeo/config";
import {
  DRIVEELY_INTERNAL_BASE,
  isDriveelyProductHost,
  toDriveelyInternalPath,
  toDriveelyRelativePath,
} from "@/lib/margeo/host";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "@/lib/margeo/supabase/env";
import { resolveOnboardingStatus } from "@/lib/margeo/onboarding-status";
import {
  buildHowItWorksPath,
  HOW_IT_WORKS_COOKIE,
  isHowItWorksCookieValue,
  resolveHowItWorksNext,
} from "@/lib/margeo/how-it-works";
import { redirectPreservingCookies } from "@/lib/margeo/auth/middleware-response";
import { MAISON_PATHS, PUBLIC_MAISON_PATHS } from "@/lib/maison/constants";
import { getMaisonSessionFromRequest } from "@/lib/maison/household-session";

const CONTROL_TOWER_PREFIX = "/control-tower";
const MAISON_PREFIX = "/demos/maison";
const LEGACY_UBERLY_PREFIX = "/demos/uberly";
const LEGACY_MARGEO_PREFIX = "/demos/margeo";
const LEGACY_UBERLY_API = "/api/uberly";
const DRIVEELY_API = "/api/driveely";

function isPassthroughPath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

function resolveRequestAppMode(request: NextRequest): DriveelyAppMode {
  const fromCookie = normalizeMode(
    request.cookies.get(DRIVEELY_APP_MODE_COOKIE)?.value,
  );
  if (fromCookie) return fromCookie;
  const betaQuery = request.nextUrl.searchParams.get("beta");
  if (betaQuery === "1" || betaQuery === "true") return "beta";
  return getDefaultAppMode();
}

function withAppModeHeaders(
  request: NextRequest,
  response: NextResponse,
  mode: DriveelyAppMode,
) {
  response.headers.set(DRIVEELY_APP_MODE_HEADER, mode);
  response.headers.set("x-driveely-host-mode", "product");
  if (
    mode === "beta" &&
    normalizeMode(request.cookies.get(DRIVEELY_APP_MODE_COOKIE)?.value) !==
      "beta"
  ) {
    const secure =
      request.nextUrl.protocol === "https:" || process.env.VERCEL === "1";
    response.cookies.set(
      DRIVEELY_APP_MODE_COOKIE,
      "beta",
      appModeCookieOptions(secure),
    );
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  if (isDriveelyProductHost(hostname)) {
    return handleDriveelyProductHost(request, pathname);
  }

  if (pathname.startsWith(LEGACY_UBERLY_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(LEGACY_UBERLY_PREFIX, DRIVEELY_INTERNAL_BASE);
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith(LEGACY_UBERLY_API)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(LEGACY_UBERLY_API, DRIVEELY_API);
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith(LEGACY_MARGEO_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(LEGACY_MARGEO_PREFIX, DRIVEELY_INTERNAL_BASE);
    return NextResponse.redirect(url, 301);
  }

  if (
    pathname === DRIVEELY_INTERNAL_BASE ||
    pathname.startsWith(`${DRIVEELY_INTERNAL_BASE}/`)
  ) {
    return handleDriveelyAuth(request, pathname, pathname);
  }

  if (pathname.startsWith(MAISON_PREFIX)) {
    return handleMaisonAuth(request, pathname);
  }

  if (!pathname.startsWith(CONTROL_TOWER_PREFIX)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(PIN_SESSION_COOKIE)?.value;
  const authenticated = await verifySessionToken(session);

  const isLogin = pathname === `${CONTROL_TOWER_PREFIX}/login`;
  const isDashboard = pathname.startsWith(`${CONTROL_TOWER_PREFIX}/dashboard`);

  if (!authenticated && isDashboard) {
    const url = request.nextUrl.clone();
    url.pathname = `${CONTROL_TOWER_PREFIX}/login`;
    return NextResponse.redirect(url);
  }

  if (authenticated && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = `${CONTROL_TOWER_PREFIX}/dashboard`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

async function handleDriveelyProductHost(
  request: NextRequest,
  pathname: string,
) {
  if (pathname.startsWith(LEGACY_UBERLY_API)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(LEGACY_UBERLY_API, DRIVEELY_API);
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith(LEGACY_UBERLY_PREFIX)) {
    const rel = pathname.slice(LEGACY_UBERLY_PREFIX.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rel;
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith(LEGACY_MARGEO_PREFIX)) {
    const rel = pathname.slice(LEGACY_MARGEO_PREFIX.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rel;
    return NextResponse.redirect(url, 301);
  }

  if (
    pathname === DRIVEELY_INTERNAL_BASE ||
    pathname.startsWith(`${DRIVEELY_INTERNAL_BASE}/`)
  ) {
    const clean = toDriveelyRelativePath(pathname);
    const url = request.nextUrl.clone();
    url.pathname = clean;
    return NextResponse.redirect(url, 301);
  }

  if (
    pathname.startsWith(MAISON_PREFIX) ||
    pathname.startsWith(CONTROL_TOWER_PREFIX)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 302);
  }

  if (isPassthroughPath(pathname)) {
    return NextResponse.next();
  }

  const internalPath = toDriveelyInternalPath(pathname);
  return handleDriveelyAuth(request, pathname, internalPath);
}

function isDriveelyProtectedPublicPath(publicPathname: string): boolean {
  const relative = toDriveelyRelativePath(publicPathname);
  return PROTECTED_DRIVEELY_PREFIXES.some(
    (p) => relative === p || relative.startsWith(`${p}/`),
  );
}

function isDriveelyPublicPath(publicPathname: string): boolean {
  const relative = toDriveelyRelativePath(publicPathname);
  const asPublicHome = relative === "/" ? DRIVEELY_PATHS.home : relative;
  if (PUBLIC_DRIVEELY_PATHS.has(publicPathname)) return true;
  if (PUBLIC_DRIVEELY_PATHS.has(asPublicHome)) return true;
  const publicRelatives = new Set(
    [...PUBLIC_DRIVEELY_PATHS].map((p) => toDriveelyRelativePath(p)),
  );
  return publicRelatives.has(relative);
}

async function handleDriveelyAuth(
  request: NextRequest,
  publicPathname: string,
  internalPath: string,
) {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoClientKey();
  const appMode = resolveRequestAppMode(request);
  const needsRewrite = publicPathname !== internalPath;

  if (!url || !key) {
    if (needsRewrite) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = internalPath;
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(DRIVEELY_APP_MODE_HEADER, appMode);
      return withAppModeHeaders(
        request,
        NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        }),
        appMode,
      );
    }
    return withAppModeHeaders(request, NextResponse.next(), appMode);
  }

  const relative = toDriveelyRelativePath(publicPathname);

  if (relative === "/signup") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = DRIVEELY_PATHS.login;
    redirectUrl.searchParams.set("mode", "signup");
    if (appMode === "beta") redirectUrl.searchParams.set("beta", "1");
    return NextResponse.redirect(redirectUrl, 308);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPath;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(DRIVEELY_APP_MODE_HEADER, appMode);

  let response = needsRewrite
    ? NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({ request: { headers: requestHeaders } });
  response = withAppModeHeaders(request, response, appMode);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        // Rebuild the response so refreshed auth cookies stick on the
        // same object we may later convert into a redirect.
        const nextHeaders = new Headers(request.headers);
        nextHeaders.set(DRIVEELY_APP_MODE_HEADER, appMode);
        response = needsRewrite
          ? NextResponse.rewrite(rewriteUrl, {
              request: { headers: nextHeaders },
            })
          : NextResponse.next({ request: { headers: nextHeaders } });
        response = withAppModeHeaders(request, response, appMode);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user: User | null = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (err) {
    // Network / JWT refresh failure must not crash Edge → "This page couldn't load"
    console.error("[driveely/middleware] getUser failed:", err);
    return response;
  }

  const isAuthPage =
    relative === "/login" || publicPathname === DRIVEELY_PATHS.login;
  const isOnboarding =
    relative === "/onboarding" || publicPathname === DRIVEELY_PATHS.onboarding;
  const isHowItWorks =
    relative === "/comment-ca-marche" ||
    publicPathname === DRIVEELY_PATHS.howItWorks;
  const isProtected = isDriveelyProtectedPublicPath(publicPathname);
  const hiwSeen = isHowItWorksCookieValue(
    request.cookies.get(HOW_IT_WORKS_COOKIE)?.value,
  );

  if (!user && (isProtected || isOnboarding || isHowItWorks)) {
    const search =
      appMode === "beta" ? "?beta=1" : "";
    const redirected = redirectPreservingCookies(
      request,
      response,
      DRIVEELY_PATHS.login,
      search,
    );
    if (isHowItWorks) {
      redirected.headers.set("x-hiw-debug", "redirect-unauth-login");
    }
    return redirected;
  }

  if (user && isAuthPage) {
    let profile = null;
    let profileError = null;
    try {
      const result = await supabase
        .from("margeo_profiles")
        .select(
          "onboarding_completed, vehicle, target_hourly, empty_returns, weekly_hours",
        )
        .eq("id", user.id)
        .maybeSingle();
      profile = result.data;
      profileError = result.error;
    } catch (err) {
      console.error("[driveely/middleware] profile read failed:", err);
      return response;
    }

    const status = resolveOnboardingStatus(profile, user, {
      profileReadError: Boolean(profileError),
    });

    const next =
      status === "complete"
        ? DRIVEELY_PATHS.dashboard
        : DRIVEELY_PATHS.onboarding;

    if (hiwSeen) {
      return redirectPreservingCookies(request, response, next, "");
    }
    const tour = new URL(buildHowItWorksPath(next), request.nextUrl.origin);
    return redirectPreservingCookies(
      request,
      response,
      tour.pathname,
      tour.search,
    );
  }

  // Tour: cookie missing → always allow. Cookie present → leave tour.
  if (user && isHowItWorks) {
    if (!hiwSeen) {
      response.headers.set("x-hiw-debug", "allow-unseen");
      return response;
    }

    let profile = null;
    let profileError = null;
    try {
      const result = await supabase
        .from("margeo_profiles")
        .select(
          "onboarding_completed, vehicle, target_hourly, empty_returns, weekly_hours",
        )
        .eq("id", user.id)
        .maybeSingle();
      profile = result.data;
      profileError = result.error;
    } catch (err) {
      console.error("[driveely/middleware] profile read failed:", err);
      response.headers.set("x-hiw-debug", "allow-seen-profile-error");
      return response;
    }

    const status = resolveOnboardingStatus(profile, user, {
      profileReadError: Boolean(profileError),
    });
    const fallback =
      status === "complete"
        ? DRIVEELY_PATHS.dashboard
        : DRIVEELY_PATHS.onboarding;
    const nextTarget = resolveHowItWorksNext(
      request.nextUrl.searchParams.get("next"),
      fallback,
    );
    const redirected = redirectPreservingCookies(
      request,
      response,
      nextTarget,
      "",
    );
    redirected.headers.set("x-hiw-debug", `redirect-seen-cookie:${nextTarget}`);
    return redirected;
  }

  if (user && (isProtected || isOnboarding)) {
    let profile = null;
    let profileError = null;
    try {
      const result = await supabase
        .from("margeo_profiles")
        .select(
          "onboarding_completed, vehicle, target_hourly, empty_returns, weekly_hours",
        )
        .eq("id", user.id)
        .maybeSingle();
      profile = result.data;
      profileError = result.error;
    } catch (err) {
      console.error("[driveely/middleware] profile read failed:", err);
      return response;
    }

    if (profileError) {
      return response;
    }

    const status = resolveOnboardingStatus(profile, user);

    // Unseen tour: force /comment-ca-marche once (new signup + existing users).
    if (!hiwSeen) {
      const nextAfterTour =
        status === "complete"
          ? resolveHowItWorksNext(relative, DRIVEELY_PATHS.dashboard)
          : DRIVEELY_PATHS.onboarding;
      const tour = new URL(
        buildHowItWorksPath(nextAfterTour),
        request.nextUrl.origin,
      );
      const redirected = redirectPreservingCookies(
        request,
        response,
        tour.pathname,
        tour.search,
      );
      redirected.headers.set(
        "x-hiw-debug",
        `force-tour-from=${relative};next=${nextAfterTour}`,
      );
      return redirected;
    }

    if (status === "complete") {
      if (isOnboarding) {
        return redirectPreservingCookies(
          request,
          response,
          DRIVEELY_PATHS.dashboard,
          "",
        );
      }
      return response;
    }

    if (status === "incomplete" && isProtected) {
      return redirectPreservingCookies(
        request,
        response,
        DRIVEELY_PATHS.onboarding,
        "",
      );
    }
  }

  return response;
}

async function handleMaisonAuth(request: NextRequest, pathname: string) {
  const session = await getMaisonSessionFromRequest(request);
  const isPublic = PUBLIC_MAISON_PATHS.has(pathname);

  if (
    pathname === `${MAISON_PREFIX}/login` ||
    pathname === `${MAISON_PREFIX}/signup`
  ) {
    const url = request.nextUrl.clone();
    url.pathname = MAISON_PATHS.connexion;
    return NextResponse.redirect(url);
  }

  if (!session && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = MAISON_PATHS.connexion;
    return NextResponse.redirect(url);
  }

  const stayOnPublicWhenSession = new Set<string>([
    MAISON_PATHS.connexion,
    MAISON_PATHS.onboarding,
    MAISON_PATHS.connexionCourses,
    MAISON_PATHS.connexionCoursesRetour,
    MAISON_PATHS.enAttente,
    MAISON_PATHS.deconnexion,
  ]);

  if (session && isPublic && !stayOnPublicWhenSession.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = MAISON_PATHS.home;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\..*).*)",
    "/",
  ],
};
