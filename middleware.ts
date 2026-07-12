import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  PIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/control-tower/pin-session";
import {
  UBERLY_PATHS,
  PUBLIC_UBERLY_PATHS,
  PROTECTED_UBERLY_PREFIXES,
} from "@/lib/margeo/constants";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "@/lib/margeo/supabase/env";
import { MAISON_PATHS, PUBLIC_MAISON_PATHS } from "@/lib/maison/constants";
import { getMaisonSessionFromRequest } from "@/lib/maison/household-session";

const CONTROL_TOWER_PREFIX = "/control-tower";
const MAISON_PREFIX = "/demos/maison";
const UBERLY_PREFIX = "/demos/uberly";
const LEGACY_MARGEO_PREFIX = "/demos/margeo";

/** Domaines Vercel du projet « margeo » (pas portfolio-omega-…). */
function isMargeoProjectHost(hostname: string): boolean {
  if (hostname === "margeo.vercel.app") return true;
  return hostname.startsWith("margeo-") && hostname.endsWith(".vercel.app");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" && isMargeoProjectHost(request.nextUrl.hostname)) {
    const url = request.nextUrl.clone();
    url.pathname = UBERLY_PATHS.home;
    return NextResponse.redirect(url, 308);
  }

  if (pathname.startsWith(LEGACY_MARGEO_PREFIX)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(LEGACY_MARGEO_PREFIX, UBERLY_PREFIX);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(UBERLY_PREFIX)) {
    return handleUberlyAuth(request, pathname);
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

function isUberlyProtected(pathname: string): boolean {
  const relative = pathname.slice(UBERLY_PREFIX.length);
  return PROTECTED_UBERLY_PREFIXES.some((p) => relative.startsWith(p));
}

async function handleUberlyAuth(request: NextRequest, pathname: string) {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoClientKey();

  if (!url || !key) {
    return NextResponse.next();
  }

  if (pathname === `${UBERLY_PREFIX}/signup`) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = UBERLY_PATHS.login;
    redirectUrl.searchParams.set("mode", "signup");
    return NextResponse.redirect(redirectUrl, 308);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_UBERLY_PATHS.has(pathname);
  const isAuthPage = pathname === UBERLY_PATHS.login;
  const isOnboarding = pathname === UBERLY_PATHS.onboarding;
  const isProtected = isUberlyProtected(pathname);

  if (!user && (isProtected || isOnboarding)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = UBERLY_PATHS.login;
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("margeo_profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      profile?.onboarding_completed === true
        ? UBERLY_PATHS.dashboard
        : UBERLY_PATHS.onboarding;
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (isProtected || isOnboarding)) {
    const { data: profile } = await supabase
      .from("margeo_profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const onboardingDone = profile?.onboarding_completed === true;

    if (!onboardingDone && isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = UBERLY_PATHS.onboarding;
      return NextResponse.redirect(redirectUrl);
    }

    if (onboardingDone && isOnboarding) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = UBERLY_PATHS.dashboard;
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (user && isPublic && pathname === UBERLY_PATHS.home) {
    // Landing accessible même connecté
  }

  return response;
}

async function handleMaisonAuth(request: NextRequest, pathname: string) {
  const session = await getMaisonSessionFromRequest(request);
  const isPublic = PUBLIC_MAISON_PATHS.has(pathname);

  if (pathname === `${MAISON_PREFIX}/login` || pathname === `${MAISON_PREFIX}/signup`) {
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
    "/",
    "/control-tower/:path*",
    "/demos/maison/:path*",
    "/demos/margeo/:path*",
    "/demos/uberly/:path*",
  ],
};
