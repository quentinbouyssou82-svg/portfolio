import { LandingNav } from "./_components/landing/landing-nav";
import { Hero } from "./_components/landing/hero";
import { Features } from "./_components/landing/features";
import { CtaSection } from "./_components/landing/cta-section";
import { SiteFooter } from "./_components/landing/site-footer";
import { WaveBackground } from "./_components/landing/wave-background";

export default function CerveauNumeriquePage() {
  return (
    <main className="cn-landing relative overflow-hidden">
      <WaveBackground />
      <LandingNav />
      <Hero />
      <Features />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
