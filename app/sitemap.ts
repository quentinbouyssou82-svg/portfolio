import type { MetadataRoute } from "next";
import {
  DRIVEELY_SITEMAP_PAGES,
  driveelyAbsoluteUrl,
  isDriveelyPubliclyIndexable,
} from "@/lib/margeo/seo";

/**
 * Product deploy (NEXT_PUBLIC_DRIVEELY_AT_ROOT=true): Driveely public pages only.
 * Portfolio / demo deploy: empty sitemap for Driveely product URLs (demo stays noindex).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isDriveelyPubliclyIndexable()) {
    return [];
  }

  const now = new Date();
  return DRIVEELY_SITEMAP_PAGES.map((page) => ({
    url: driveelyAbsoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
