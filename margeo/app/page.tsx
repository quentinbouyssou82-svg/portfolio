import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingNav } from "@/components/landing/nav";
import { Presentation } from "@/components/landing/presentation";
import { Screens } from "@/components/landing/screens";

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
