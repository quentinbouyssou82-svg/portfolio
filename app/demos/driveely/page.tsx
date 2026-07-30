import dynamic from "next/dynamic";
import { Faq } from "@/components/margeo/landing/faq";
import { FinalCta } from "@/components/margeo/landing/final-cta";
import { Footer } from "@/components/margeo/landing/footer";
import { Hero } from "@/components/margeo/landing/hero";
import { LandingBackdrop } from "@/components/margeo/landing/landing-backdrop";
import { LandingNav } from "@/components/margeo/landing/nav";
import { PlatformMarquee } from "@/components/margeo/landing/platform-marquee";
import { LandingStickyCta } from "@/components/margeo/landing/sticky-cta";
import { JsonLd } from "@/components/margeo/seo/json-ld";
import { PRODUCT_DESCRIPTION } from "@/lib/margeo/brand";
import { driveelyLandingJsonLdGraph } from "@/lib/margeo/json-ld";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";

const StoryProblem = dynamic(
  () =>
    import("@/components/margeo/landing/story-problem").then((m) => m.StoryProblem),
  { ssr: true },
);
const StoryDecision = dynamic(
  () =>
    import("@/components/margeo/landing/story-decision").then(
      (m) => m.StoryDecision,
    ),
  { ssr: true },
);
const SocialProof = dynamic(
  () =>
    import("@/components/margeo/landing/social-proof").then((m) => m.SocialProof),
  { ssr: true },
);
const TrustSection = dynamic(
  () =>
    import("@/components/margeo/landing/trust-section").then((m) => m.TrustSection),
  { ssr: true },
);

export const metadata: Metadata = buildDriveelyMetadata({
  description: PRODUCT_DESCRIPTION,
  path: "/",
});

export default function LandingPage() {
  return (
    <>
      <JsonLd id="driveely-ld-landing" data={driveelyLandingJsonLdGraph()} />
      <LandingBackdrop />
      <LandingNav />
      <main className="landing-page relative z-[1]">
        <Hero />
        <PlatformMarquee />
        <StoryProblem />
        <StoryDecision />
        <SocialProof />
        <TrustSection />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <LandingStickyCta />
    </>
  );
}
