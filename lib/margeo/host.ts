/**
 * Hôtes du produit Driveely (domaine dédié).
 * Sur ces hôtes, Nocta / portfolio ne doit jamais être servi :
 * le middleware rewrite vers /demos/driveely (fichiers) tout en exposant des URLs racine.
 */

const STATIC_DRIVEELY_HOSTS = new Set([
  "driveely.app",
  "www.driveely.app",
  "beta.driveely.app",
  "margeo.vercel.app",
]);

export function isDriveelyProductHost(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0] ?? "";
  if (!host) return false;
  if (STATIC_DRIVEELY_HOSTS.has(host)) return true;
  // Previews / aliases du projet Vercel « margeo »
  if (host.startsWith("margeo-") && host.endsWith(".vercel.app")) return true;

  const extra = process.env.DRIVEELY_PRODUCT_HOSTS?.split(",") ?? [];
  return extra.some((h) => h.trim().toLowerCase() === host);
}

/** Fichiers Next restent sous ce préfixe interne. */
export const DRIVEELY_INTERNAL_BASE = "/demos/driveely";

/**
 * URLs publiques.
 * Sur le projet produit (driveely.app) : NEXT_PUBLIC_DRIVEELY_AT_ROOT=true → "/" .
 * Sur le monorepo portfolio (demos) : false → "/demos/driveely".
 */
export function isDriveelyAtRoot(): boolean {
  return process.env.NEXT_PUBLIC_DRIVEELY_AT_ROOT === "true";
}

export function getDriveelyPublicBase(): string {
  return isDriveelyAtRoot() ? "" : DRIVEELY_INTERNAL_BASE;
}

/** Chemin public → chemin interne (fichiers app/demos/driveely). */
export function toDriveelyInternalPath(pathname: string): string {
  if (
    pathname === DRIVEELY_INTERNAL_BASE ||
    pathname.startsWith(`${DRIVEELY_INTERNAL_BASE}/`)
  ) {
    return pathname === DRIVEELY_INTERNAL_BASE
      ? DRIVEELY_INTERNAL_BASE
      : pathname;
  }
  if (pathname === "/" || pathname === "") {
    return DRIVEELY_INTERNAL_BASE;
  }
  return `${DRIVEELY_INTERNAL_BASE}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/** Chemin quelconque → segment relatif Driveely ("/login", "/", …). */
export function toDriveelyRelativePath(pathname: string): string {
  if (
    pathname === DRIVEELY_INTERNAL_BASE ||
    pathname.startsWith(`${DRIVEELY_INTERNAL_BASE}/`)
  ) {
    const rel = pathname.slice(DRIVEELY_INTERNAL_BASE.length);
    return rel || "/";
  }
  return pathname || "/";
}
