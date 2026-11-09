import { RevealItem, RevealStagger } from "./reveal";
import { SiteSection } from "./site-section";

const STEPS = [
  {
    n: "01",
    title: "Mesurez",
    body: "Capturez une offre. Driveely lit les infos de la course et les croise avec votre profil : coût au km, objectif €/h, retour à vide.",
  },
  {
    n: "02",
    title: "Calculez",
    body: "Revenus, distance, temps et coûts sont mis en relation pour estimer ce qu’il vous reste vraiment.",
  },
  {
    n: "03",
    title: "Analysez",
    body: "Les chiffres deviennent lisibles : net estimé, €/h, coût, score — sans tableau de bord incompréhensible.",
  },
  {
    n: "04",
    title: "Obtenez votre verdict",
    body: "Accepter, vérifier ou refuser. Driveely vous explique si la course vaut le coup — et pourquoi.",
  },
] as const;

export function SiteHow() {
  return (
    <SiteSection
      id="comment"
      label="Comment ça marche"
      title="Mesurer → Calculer → Analyser → Verdict"
      description="Quatre étapes. Un seul objectif : vous dire clairement si une course vaut le coup."
      className="site-below-fold bg-[#09090B]"
    >
      <RevealStagger className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <RevealItem key={step.n} index={i}>
            <article className="site-card h-full p-5 sm:p-6">
              <p className="text-[12px] font-semibold tracking-[0.12em] text-[#818CF8]">
                {step.n}
              </p>
              <h3 className="mt-2 text-[1.05rem] font-bold tracking-tight text-[#FAFAFA] sm:mt-3 sm:text-[1.1rem]">
                {step.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#A1A1AA]">
                {step.body}
              </p>
            </article>
          </RevealItem>
        ))}
      </RevealStagger>
    </SiteSection>
  );
}
