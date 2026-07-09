import { ApexApproach } from "@/components/apex-advisory/apex-approach";
import { ApexCredibility } from "@/components/apex-advisory/apex-credibility";
import { ApexCta } from "@/components/apex-advisory/apex-cta";
import { ApexFooter } from "@/components/apex-advisory/apex-footer";
import { ApexHero } from "@/components/apex-advisory/apex-hero";
import { ApexMotionProvider } from "@/components/apex-advisory/apex-motion-provider";
import { ApexNav } from "@/components/apex-advisory/apex-nav";
import { ApexScrollProgress } from "@/components/apex-advisory/apex-scroll-progress";
import { ApexScrollStory } from "@/components/apex-advisory/apex-scroll-story";
import { ApexServices } from "@/components/apex-advisory/apex-services";

export default function ApexAdvisoryPage() {
  return (
    <ApexMotionProvider>
      <ApexScrollProgress />
      <ApexNav />
      <ApexScrollStory>
        <ApexHero />
        <ApexServices />
        <ApexApproach />
        <ApexCredibility />
        <ApexCta />
      </ApexScrollStory>
      <ApexFooter />
    </ApexMotionProvider>
  );
}
