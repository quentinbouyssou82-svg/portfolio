import { SiteSection } from "./site-section";

export function SiteProblem() {
  return (
    <SiteSection
      id="probleme"
      label="Le problème"
      title="Vos revenus ne racontent pas toute l’histoire."
      description="Les plateformes affichent surtout ce qu’elles vous paient. Elles ne calculent pas ce que la course vous coûte vraiment — carburant, usure, temps — ni si elle vaut le coup pour votre activité."
      className="site-below-fold bg-[#09090B]"
    />
  );
}
