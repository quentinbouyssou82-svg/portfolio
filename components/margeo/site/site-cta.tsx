import { Reveal } from "./reveal";
import { SiteSection } from "./site-section";
import { StoreBadgeRow } from "./store-badges";

export function SiteCta() {
  return (
    <SiteSection
      label="Télécharger"
      title="Découvrez ce que vous gagnez vraiment."
      description="Driveely ne vous donne pas seulement des chiffres. Il les analyse — et vous explique ce qu’ils signifient."
      className="pb-[max(5rem,calc(env(safe-area-inset-bottom)+3rem))] sm:pb-24"
    >
      <Reveal delay={0.06}>
        <div className="mt-8 flex justify-center sm:mt-10">
          <StoreBadgeRow />
        </div>
      </Reveal>
    </SiteSection>
  );
}
