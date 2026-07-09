import { Faq } from "@/components/margeo/landing/faq";
import { Features } from "@/components/margeo/landing/features";
import { FinalCta } from "@/components/margeo/landing/final-cta";
import { Footer } from "@/components/margeo/landing/footer";
import { Hero } from "@/components/margeo/landing/hero";
import { HowItWorks } from "@/components/margeo/landing/how-it-works";
import { LandingNav } from "@/components/margeo/landing/nav";
import { Presentation } from "@/components/margeo/landing/presentation";
import { Screens } from "@/components/margeo/landing/screens";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Presentation />
        <HowItWorks />
        <Features />
        <Screens />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
