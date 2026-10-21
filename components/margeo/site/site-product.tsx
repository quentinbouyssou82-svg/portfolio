import { RevealItem, RevealStagger } from "./reveal";
import { SiteSection } from "./site-section";

const QUESTIONS = [
  {
    q: "Combien je gagne vraiment sur cette course ?",
    a: "Driveely estime le net après vos coûts — pas seulement le montant affiché par la plateforme.",
  },
  {
    q: "Combien cette course me coûte ?",
    a: "Distance et coût au km de votre profil pour estimer le coût réel de la course.",
  },
  {
    q: "Est-ce que ça vaut mon temps ?",
    a: "Un €/h estimé, confronté à votre objectif horaire.",
  },
  {
    q: "Je dois l’accepter ?",
    a: "Un verdict clair : accepter, vérifier ou refuser — avec un score 0–100.",
  },
  {
    q: "Où j’en suis aujourd’hui ?",
    a: "Suivez le net estimé de vos analyses et votre objectif du jour.",
  },
  {
    q: "Comment je décide plus vite ?",
    a: "Back Tap et Centre de contrôle pour lancer une analyse sans ouvrir l’app.",
  },
] as const;

export function SiteProduct() {
  return (
    <SiteSection
      id="produit"
      label="Ce que vous apprenez"
      title="Des réponses, pas une liste de fonctionnalités."
      description="Les questions que vous vous posez entre deux courses — avec une analyse claire derrière."
      className="site-below-fold bg-[#09090B]"
    >
      <RevealStagger className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUESTIONS.map((item, i) => (
          <RevealItem key={item.q} index={i}>
            <div className="site-card h-full p-5 sm:p-6">
              <h3 className="text-[1rem] font-semibold text-[#FAFAFA] sm:text-[1.02rem]">
                {item.q}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[#A1A1AA]">
                {item.a}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealStagger>
    </SiteSection>
  );
}
