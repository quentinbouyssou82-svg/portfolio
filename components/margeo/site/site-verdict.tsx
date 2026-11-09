import { Reveal } from "./reveal";
import { SiteSection } from "./site-section";

/** Example grounded in real app outputs: score, verdict, net, €/h — illustrative. */
export function SiteVerdict() {
  return (
    <SiteSection
      id="verdict"
      label="Le verdict"
      title={
        <>
          Pas seulement des chiffres.
          <br className="hidden sm:block" />
          Un verdict.
        </>
      }
      description="Driveely ne s’arrête pas à « 12,40 € » ou « 4,2 km ». Il interprète l’offre avec vos coûts et vous dit clairement si elle vaut le coup."
      className="site-below-fold bg-[#0E0E11]"
    >
      <Reveal delay={0.08} scale className="mx-auto mt-8 max-w-md sm:mt-10">
        <div className="site-card site-verdict-glow rounded-3xl p-5 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-[#8B8B94]">Analyse</p>
            <span className="rounded-full bg-[#34D399]/15 px-3 py-1 text-[12px] font-semibold text-[#34D399]">
              Accepter
            </span>
          </div>
          <p className="mt-4 text-[12px] font-medium text-[#8B8B94]">Score</p>
          <p className="text-[44px] font-bold leading-none tracking-tight text-[#FAFAFA] tabular-nums sm:text-[48px]">
            84
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-5 sm:mt-6 sm:gap-3">
            {[
              { k: "Net estimé", v: "6,10 €" },
              { k: "€/h estimé", v: "22,9" },
              { k: "Coût estimé", v: "1,80 €" },
            ].map((row) => (
              <div key={row.k} className="text-center">
                <p className="text-[10px] font-medium leading-tight text-[#8B8B94]">
                  {row.k}
                </p>
                <p className="mt-1 text-[13px] font-semibold tabular-nums text-[#FAFAFA] sm:text-[14px]">
                  {row.v}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-[#A1A1AA] sm:mt-6">
            « Offre au-dessus de votre objectif €/h. Après vos coûts au km, le
            net estimé reste intéressant. »
          </p>
        </div>
      </Reveal>
    </SiteSection>
  );
}
