import { Reveal } from "./reveal";
import { SiteSection } from "./site-section";

export function SiteGoals() {
  return (
    <SiteSection
      id="objectifs"
      label="Objectifs"
      title="Analysés — pas juste affichés."
      description="Définissez un objectif du jour. Driveely suit le net estimé de vos analyses et vous montre où vous en êtes."
      className="bg-[#0E0E11]"
      innerClassName="lg:grid lg:grid-cols-2 lg:items-center lg:gap-14"
      centered={false}
    >
      <Reveal delay={0.06} className="lg:col-start-2">
        <div className="site-card mx-auto mt-8 max-w-md rounded-3xl p-5 sm:mt-10 sm:p-8 lg:mx-0 lg:mt-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8B8B94]">
            Objectif du jour
          </p>
          <p className="mt-2 text-[1.35rem] font-bold text-[#FAFAFA]">80 €</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full w-[66%] rounded-full bg-[#818CF8] transition-[width] duration-700 ease-out"
              aria-hidden
            />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] text-[#8B8B94]">Réalisé (estimé)</p>
              <p className="text-[1.5rem] font-bold tabular-nums text-[#FAFAFA]">
                52,80 €
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#8B8B94]">Restant</p>
              <p className="text-[1.1rem] font-semibold tabular-nums text-[#A1A1AA]">
                27,20 €
              </p>
            </div>
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-[#A1A1AA]">
            « Vous êtes à 66 % de votre objectif. Continuez sur ce rythme pour
            le terminer. »
          </p>
        </div>
      </Reveal>
    </SiteSection>
  );
}
