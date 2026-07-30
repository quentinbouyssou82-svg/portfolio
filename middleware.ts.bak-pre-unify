import { createServerClient } from "@supabase/ssr";
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
import { getAppMode } from "@/lib/margeo/config";
import {
  DRIVEELY_INTERNAL_BASE,
  isDriveelyProductHost,
  toDriveelyInternalPath,
  toDriveelyRelativePath,
} from "@/lib/margeo/host";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "@/lib/margeo/supabase/env";
import { resolveOnboardingStatus } from "@/lib/margeo/onboarding-status";
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
  // Fichiers statiques (favicon, images, robots…)
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.nextUrl.hostname;

  // ── Produit Driveely (driveely.app, margeo.vercel.app, …) ─────────────
  // Cause historique : "/" servait app/page.tsx (Nocta). Sur ces hôtes,
  // on rewrite vers /demos/driveely tout en exposant des URLs racine.
  if (isDriveelyProductHost(hostname)) {
    return handleDriveelyProductHost(request, pathname);
  }

  // ── Monorepo portfolio (Nocta + demos) ────────────────────────────────
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
  // Legacy API
  if (pathname.startsWith(LEGACY_UBERLY_API)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(LEGACY_UBERLY_API, DRIVEELY_API);
    return NextResponse.redirect(url, 301);
  }

  // Legacy /demos/uberly → URL propre
  if (pathname.startsWith(LEGACY_UBERLY_PREFIX)) {
    const rel = pathname.slice(LEGACY_UBERLY_PREFIX.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rel;
    return NextResponse.redirect(url, 301);
  }

  // /demos/margeo → URL propre
  if (pathname.startsWith(LEGACY_MARGEO_PREFIX)) {
    const rel = pathname.slice(LEGACY_MARGEO_PREFIX.length) || "/";
    const url = request.nextUrl.clone();
    url.pathname = rel;
    return NextResponse.redirect(url, 301);
  }

  // Canonique : /demos/driveely/* → /* (plus de préfixe public)
  if (
    pathname === DRIVEELY_INTERNAL_BASE ||
    pathname.startsWith(`${DRIVEELY_INTERNAL_BASE}/`)
  ) {
    const clean = toDriveelyRelativePath(pathname);
    const url = request.nextUrl.clone();
    url.pathname = clean;
    return NextResponse.redirect(url, 301);
  }

  // Nocta / autres apps du monorepo : non servis sur le domaine produit
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
  // PUBLIC_DRIVEELY_PATHS contient les chemins publics (selon AT_ROOT)
  if (PUBLIC_DRIVEELY_PATHS.has(publicPathname)) return true;
  if (PUBLIC_DRIVEELY_PATHS.has(asPublicHome)) return true;
  // Fallback relatif : /login, /cgu… même si la base publique change
  const publicRelatives = new Set(
    [...PUBLIC_DRIVEELY_PATHS].map((p) => toDriveelyRelativePath(p)),
  );
  return publicRelatives.has(relative);
}

/**
 * @param publicPathname — URL vue par l'utilisateur (/login ou /demos/driveely/login)
 * @param internalPath — chemin fichiers Next (/demos/driveely/…)
 */
async function handleDriveelyAuth(
  request: NextRequest,
  publicPathname: string,
  internalPath: string,
) {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoClientKey();

  const needsRewrite = publicPathname !== internalPath;

  if (!url || !key) {
    if (needsRewrite) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = internalPath;
      return NextResponse.rewrite(rewriteUrl);
    }
    return NextResponse.next();
  }

  const relative = toDriveelyRelativePath(publicPathname);

  if (relative === "/signup") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = DRIVEELY_PATHS.login;
    redirectUrl.searchParams.set("mode", "signup");
    return NextResponse.redirect(redirectUrl, 308);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPath;

  let response = needsRewrite
    ? NextResponse.rewrite(rewriteUrl)
    : NextResponse.next({ request });
  response.headers.set("x-driveely-app-mode", getAppMode());
  response.headers.set("x-driveely-host-mode", "product");

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

  const isPublic = isDriveelyPublicPath(publicPathname);
  const isAuthPage =
    relative === "/login" || publicPathname === DRIVEELY_PATHS.login;
  const isOnboarding =
    relative === "/onboarding" || publicPathname === DRIVEELY_PATHS.onboarding;
  const isProtected = isDriveelyProtectedPublicPath(publicPathname);

  if (!user && (isProtected || isOnboarding)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = DRIVEELY_PATHS.login;
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const { data: profile, error: profileError } = await supabase
      .from("margeo_profiles")
      .select(
        "onboarding_completed, vehicle, target_hourly, empty_returns, weekly_hours",
      )
      .eq("id", user.id)
      .maybeSingle();

    const status = resolveOnboardingStatus(profile, user, {
      profileReadError: Boolean(profileError),
    });

    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname =
      status === "complete"
        ? DRIVEELY_PATHS.dashboard
        : DRIVEELY_PATHS.onboarding;
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (isProtected || isOnboarding)) {
    const { data: profile, error: profileError } = await supabase
      .from("margeo_profiles")
      .select(
        "onboarding_completed, vehicle, target_hourly, empty_returns, weekly_hours",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return response;
    }

    const status = resolveOnboardingStatus(profile, user);

    if (status === "complete") {
      if (isOnboarding) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = DRIVEELY_PATHS.dashboard;
        return NextResponse.redirect(redirectUrl);
      }
      return response;
    }

    if (status === "incomplete" && isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = DRIVEELY_PATHS.onboarding;
      return NextResponse.redirect(redirectUrl);
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
    /*
     * Toutes les pages (hôte Driveely → rewrite racine).
     * Exclut assets Next et fichiers avec extension.
     */
    "/((?!_next/static|_next/image|.*\\..*).*)",
    "/",
  ],
};
