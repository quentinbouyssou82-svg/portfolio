import type { MetadataRoute } from "next";
import {
  DRIVEELY_ROBOTS_DISALLOW,
  getDriveelySiteOrigin,
  isDriveelyPubliclyIndexable,
} from "@/lib/margeo/seo";

/**
 * Optimized for driveely.app product host.
 * On portfolio demo deploy: disallow Driveely demo paths + avoid indexing demos.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getDriveelySiteOrigin();

  if (!isDriveelyPubliclyIndexable()) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/demos/driveely",
            "/demos/driveely/",
            "/api/",
            "/control-tower",
          ],
        },
      ],
      sitemap: `${origin}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...DRIVEELY_ROBOTS_DISALLOW],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/contact"],
        disallow: [...DRIVEELY_ROBOTS_DISALLOW],
      },
      {
        userAgent: "ChatGPT-User",
        allow: ["/", "/contact"],
        disallow: [...DRIVEELY_ROBOTS_DISALLOW],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/contact"],
        disallow: [...DRIVEELY_ROBOTS_DISALLOW],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/contact"],
        disallow: [...DRIVEELY_ROBOTS_DISALLOW],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/contact"],
        disallow: [...DRIVEELY_ROBOTS_DISALLOW],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/contact"],
        disallow: [...DRIVEELY_ROBOTS_DISALLOW],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, ""),
  };
}
