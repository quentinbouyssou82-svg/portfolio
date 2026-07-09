import { MeridianApproach } from "@/components/meridian-capital/meridian-approach";
import { MeridianCredibility } from "@/components/meridian-capital/meridian-credibility";
import { MeridianCta } from "@/components/meridian-capital/meridian-cta";
import { MeridianExpertise } from "@/components/meridian-capital/meridian-expertise";
import { MeridianFooter } from "@/components/meridian-capital/meridian-footer";
import { MeridianHero } from "@/components/meridian-capital/meridian-hero";
import { MeridianNav } from "@/components/meridian-capital/meridian-nav";

export default function MeridianCapitalPage() {
  return (
    <>
      <MeridianNav />
      <main>
        <MeridianHero />
        <MeridianExpertise />
        <MeridianApproach />
        <MeridianCredibility />
        <MeridianCta />
      </main>
      <MeridianFooter />
    </>
  );
}
