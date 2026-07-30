import type { Metadata } from "next";
import {
  PRODUCT_DESCRIPTION,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
} from "@/lib/margeo/brand";
import { isDriveelyAtRoot } from "@/lib/margeo/host";

/** Production origin for Driveely canonicals / sitemap / OG. */
export function getDriveelySiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    // Portfolio localhost / preview must not become the public canonical.
    try {
      const host = new URL(fromEnv).hostname;
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.endsWith(".ngrok-free.dev") ||
        host.endsWith(".ngrok-free.app") ||
        host.endsWith(".ngrok.app") ||
        host.endsWith(".ngrok.io")
      ) {
        return "https://driveely.app";
      }
      return fromEnv;
    } catch {
      /* fall through */
    }
  }
  return "https://driveely.app";
}

/** Absolute public URL on the product host (root paths, never /demos/driveely). */
export function driveelyAbsoluteUrl(pathname = "/"): string {
  const origin = getDriveelySiteOrigin();
  if (!pathname || pathname === "/") return `${origin}/`;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}

/**
 * Indexable only on the product deployment (URLs at root).
 * Portfolio demo paths stay noindex to avoid duplicate content.
 */
export function isDriveelyPubliclyIndexable(): boolean {
  return isDriveelyAtRoot();
}

export const DRIVEELY_OG_IMAGE_PATH = "/driveely/og.png";
export const DRIVEELY_OG_IMAGE = {
  url: DRIVEELY_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
} as const;

/** Public marketing pages listed in sitemap (product host only). */
export const DRIVEELY_SITEMAP_PAGES: ReadonlyArray<{
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
];

/** App / auth paths that must stay out of the index. */
export const DRIVEELY_ROBOTS_DISALLOW = [
  "/dashboard",
  "/analyse",
  "/historique",
  "/profil",
  "/premium",
  "/subscription",
  "/onboarding",
  "/login",
  "/signup",
  "/forgot-password",
  "/deconnexion",
  "/retour",
  "/questionnaire",
  "/auth/",
  "/api/",
  "/beta",
  "/conditions-beta",
  "/mentions-legales",
  "/confidentialite",
  "/cgu",
  "/cgv",
  "/cookies",
  "/remboursement",
  "/demandes-rgpd",
  "/suppression-donnees",
  "/securite-donnees",
  "/abonnements-stripe",
  "/propriete-intellectuelle",
  "/charte-utilisation",
] as const;

export type DriveelyPageSeo = {
  title?: string;
  description?: string;
  path?: string;
  /** Override indexability (defaults to product-host rule). */
  index?: boolean;
  follow?: boolean;
  ogType?: "website" | "article";
};

export function buildDriveelyTitle(
  pageTitle?: string,
  opts?: { modeSuffix?: string },
): string {
  const suffix = opts?.modeSuffix ?? "";
  if (!pageTitle) {
    return `${PRODUCT_NAME}${suffix} — Gain net avant d'accepter`;
  }
  return `${pageTitle} · ${PRODUCT_NAME}${suffix}`;
}

export function buildDriveelyMetadata({
  title,
  description = PRODUCT_DESCRIPTION,
  path = "/",
  index,
  follow,
  ogType = "website",
  modeSuffix = "",
}: DriveelyPageSeo & { modeSuffix?: string } = {}): Metadata {
  const canIndex =
    typeof index === "boolean" ? index : isDriveelyPubliclyIndexable();
  const canFollow =
    typeof follow === "boolean" ? follow : canIndex;
  const canonical = driveelyAbsoluteUrl(path);
  const pageTitle = title
    ? buildDriveelyTitle(title, { modeSuffix })
    : buildDriveelyTitle(undefined, { modeSuffix });
  const shortTitle = title ?? `${PRODUCT_NAME}${modeSuffix} — Gain net avant d'accepter`;

  return {
    title: title
      ? { absolute: pageTitle }
      : {
          default: pageTitle,
          template: `%s · ${PRODUCT_NAME}${modeSuffix}`,
        },
    description,
    applicationName: PRODUCT_NAME,
    authors: [{ name: PRODUCT_NAME }],
    creator: PRODUCT_NAME,
    publisher: PRODUCT_NAME,
    category: "productivity",
    keywords: [
      "Driveely",
      "Uber Eats rentabilité",
      "calculateur course livraison",
      "gain net livreur",
      "Deliveroo rentabilité",
      "Stuart livraison",
      "coût au km livreur",
      "optimisation courses livraison",
      "revenu livreur indépendant",
    ],
    metadataBase: new URL(getDriveelySiteOrigin()),
    alternates: {
      canonical,
    },
    robots: canIndex
      ? {
          index: true,
          follow: canFollow,
          googleBot: {
            index: true,
            follow: canFollow,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false, nocache: true },
    openGraph: {
      type: ogType,
      locale: "fr_FR",
      url: canonical,
      siteName: PRODUCT_NAME,
      title: shortTitle,
      description,
      images: [DRIVEELY_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: shortTitle,
      description,
      images: [DRIVEELY_OG_IMAGE.url],
    },
    icons: {
      icon: [
        { url: "/driveely/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/driveely/favicon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/driveely/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/driveely/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: ["/driveely/favicon-32.png"],
    },
    manifest: "/driveely/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: `${PRODUCT_NAME}${modeSuffix}`,
    },
  };
}
