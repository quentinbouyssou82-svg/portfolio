import { Faq } from "@/components/margeo/landing/faq";
import { FinalCta } from "@/components/margeo/landing/final-cta";
import { Footer } from "@/components/margeo/landing/footer";
import { Hero } from "@/components/margeo/landing/hero";
import { InteractiveDemo } from "@/components/margeo/landing/interactive-demo";
import { LandingBackdrop } from "@/components/margeo/landing/landing-backdrop";
import { LandingNav } from "@/components/margeo/landing/nav";
import { PlatformMarquee } from "@/components/margeo/landing/platform-marquee";
import { SocialProof } from "@/components/margeo/landing/social-proof";
import { StoryDecision } from "@/components/margeo/landing/story-decision";
import { StoryProblem } from "@/components/margeo/landing/story-problem";
import { LandingStickyCta } from "@/components/margeo/landing/sticky-cta";

export default function LandingPage() {
  return (
    <>
      <LandingBackdrop />
      <LandingNav />
      <main className="landing-page relative z-[1]">
        <Hero />
        <PlatformMarquee />
        <StoryProblem />
        <InteractiveDemo />
        <StoryDecision />
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <LandingStickyCta />
    </>
  );
}
