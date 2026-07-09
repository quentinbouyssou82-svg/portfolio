import { MeridianReveal } from "./meridian-reveal";

const stats = [
  { value: "+2,4", unit: "Md€", label: "Actifs structurés" },
  { value: "18", unit: "ans", label: "D'expertise cumulée" },
  { value: "120", unit: "+", label: "Mandats actifs" },
  { value: "97", unit: "%", label: "Taux de renouvellement" },
];

export function MeridianCredibility() {
  return (
    <section id="credibilite" className="mc-section relative">
      <div className="mc-section-divider" />

      <div className="meridian-wrap">
        <div className="max-w-lg">
          <MeridianReveal>
            <p className="mc-eyebrow">Crédibilité</p>
            <h2 className="font-display mc-display-md mt-8">
              Des chiffres qui
              <em className="text-[var(--mc-text-muted)] not-italic"> témoignent</em>
            </h2>
          </MeridianReveal>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {stats.map((stat, i) => (
            <MeridianReveal key={stat.label} delay={i * 0.07}>
              <div className="mc-stat rounded-xl p-7 md:p-9">
                <div className="flex items-baseline gap-1">
                  <span className="mc-stat-value text-[clamp(2.25rem,4.5vw,3rem)] leading-none">
                    {stat.value}
                  </span>
                  <span className="mc-stat-unit">{stat.unit}</span>
                </div>
                <p className="mt-5 text-[0.625rem] uppercase tracking-[0.2em] text-[var(--mc-text-muted)]">
                  {stat.label}
                </p>
              </div>
            </MeridianReveal>
          ))}
        </div>

        <MeridianReveal delay={0.15}>
          <p className="mc-body-sm mx-auto mt-16 max-w-xl text-center">
            Cabinet indépendant, sans conflit d&apos;intérêts. Membre de l&apos;ANACOFI,
            agréé AMF. Confidentialité absolue et discrétion institutionnelle.
          </p>
        </MeridianReveal>
      </div>
    </section>
  );
}
