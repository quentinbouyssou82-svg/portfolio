import { PalanAudiences } from "@/components/palan-capital/palan-audiences";
import { PalanConvictions } from "@/components/palan-capital/palan-convictions";
import { PalanCta } from "@/components/palan-capital/palan-cta";
import { PalanExpertises } from "@/components/palan-capital/palan-expertises";
import { PalanFooter } from "@/components/palan-capital/palan-footer";
import { PalanHero } from "@/components/palan-capital/palan-hero";
import { PalanMotionProvider } from "@/components/palan-capital/palan-motion-provider";
import { PalanNav } from "@/components/palan-capital/palan-nav";
import { PalanScrollProgress } from "@/components/palan-capital/palan-scroll-progress";

export default function PalanCapitalPage() {
  return (
    <PalanMotionProvider>
      <PalanScrollProgress />
      <PalanNav />
      <main className="ax-main">
        <PalanHero />
        <PalanExpertises />
        <PalanConvictions />
        <PalanAudiences />
        <PalanCta />
      </main>
      <PalanFooter />
    </PalanMotionProvider>
  );
}
