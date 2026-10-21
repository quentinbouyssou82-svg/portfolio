import { SiteFooter } from "@/components/margeo/site/site-footer";
import { SiteHub } from "@/components/margeo/site/site-hub";
import { SiteNav } from "@/components/margeo/site/site-nav";
import { JsonLd } from "@/components/margeo/seo/json-ld";
import { PRODUCT_TAGLINE } from "@/lib/margeo/brand";
import {
  driveelyOrganizationJsonLd,
  driveelyWebSiteJsonLd,
} from "@/lib/margeo/json-ld";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";
import "@/components/margeo/site/site-marketing.css";

export const metadata: Metadata = {
  ...buildDriveelyMetadata({
    title: "Contact & documents",
    description: `${PRODUCT_TAGLINE} Contact officiel et documents importants Driveely.`,
    path: "/",
  }),
  other: {
    "driveely-landing": "hub",
  },
};

/** Fully static HTML — zero client React on hub. */
export const dynamic = "force-static";

export default function LandingPage() {
  return (
    <>
      <JsonLd
        id="driveely-ld-landing"
        data={{
          "@context": "https://schema.org",
          "@graph": [driveelyOrganizationJsonLd(), driveelyWebSiteJsonLd()],
        }}
      />
      <div className="flex min-h-dvh flex-col overflow-x-hidden bg-[#09090B] text-[#FAFAFA] antialiased">
        <SiteNav />
        <SiteHub />
        <SiteFooter />
      </div>
    </>
  );
}
