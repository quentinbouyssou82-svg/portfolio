import { Reveal } from "./reveal";
import { SiteSection } from "./site-section";

export function SiteContrast() {
  return (
    <SiteSection
      label="La différence"
      title={
        <>
          Les plateformes montrent vos revenus.
          <br className="hidden sm:block" />
          Driveely montre la réalité de votre activité.
        </>
      }
      className="site-below-fold bg-[#0E0E11]"
    >
      <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2">
        <Reveal delay={0.04}>
          <article className="site-card h-full p-5 sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8B8B94]">
              Plateformes
            </p>
            <h3 className="mt-3 text-[1.1rem] font-bold text-[#FAFAFA] sm:text-[1.2rem]">
              Ce qu’elles vous paient
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#A1A1AA]">
              Un montant. Une distance affichée. Peu d’explications sur ce
              qu’il vous reste après vos coûts.
            </p>
          </article>
        </Reveal>
        <Reveal delay={0.1}>
          <article className="site-card site-card-accent h-full p-5 sm:p-8">
            <p className="site-section-label text-[12px]">Driveely</p>
            <h3 className="mt-3 text-[1.1rem] font-bold text-[#FAFAFA] sm:text-[1.2rem]">
              Ce que ça vous rapporte vraiment
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#A1A1AA]">
              Driveely croise l’offre avec{" "}
              <span className="text-[#FAFAFA]">vos coûts</span> et{" "}
              <span className="text-[#FAFAFA]">vos objectifs</span>, estime le
              net, puis vous donne un verdict clair — pas seulement un chiffre.
            </p>
          </article>
        </Reveal>
      </div>
    </SiteSection>
  );
}
