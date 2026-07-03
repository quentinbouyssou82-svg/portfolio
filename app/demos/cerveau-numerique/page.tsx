import { LandingNav } from "./_components/landing/landing-nav";
import { Hero } from "./_components/landing/hero";
import { ProductPreview } from "./_components/landing/product-preview";
import { Features } from "./_components/landing/features";
import { CtaSection } from "./_components/landing/cta-section";
import { SiteFooter } from "./_components/landing/site-footer";

export default function CerveauNumeriquePage() {
  return (
    <main className="cn-landing relative overflow-hidden bg-[var(--cn-hero-bg)]">
      <LandingNav />
      <Hero />
      <ProductPreview />
      <Features />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
