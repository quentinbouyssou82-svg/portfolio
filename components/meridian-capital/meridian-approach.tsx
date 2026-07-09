import { MeridianReveal } from "./meridian-reveal";

const steps = [
  {
    number: "01",
    title: "Analyse",
    description:
      "Diagnostic approfondi de votre situation patrimoniale, fiscale et opérationnelle. Identification des leviers et des contraintes.",
  },
  {
    number: "02",
    title: "Structuration",
    description:
      "Conception de l'architecture financière optimale — véhicules, montages et gouvernance adaptés à vos objectifs.",
  },
  {
    number: "03",
    title: "Optimisation",
    description:
      "Mise en œuvre, suivi et ajustements continus. Reporting clair et recommandations proactives dans la durée.",
  },
];

export function MeridianApproach() {
  return (
    <section id="approche" className="mc-section relative bg-[var(--mc-bg-secondary)]">
      <div className="mc-section-divider" />
      <div className="mc-aurora opacity-30" />
      <div className="mc-grain" />

      <div className="meridian-wrap relative">
        <div className="max-w-xl">
          <MeridianReveal>
            <p className="mc-eyebrow">Approche</p>
            <h2 className="font-display mc-display-md mt-8">
              Une méthode rigoureuse,
              <em className="mc-gold-text not-italic"> en trois étapes</em>
            </h2>
          </MeridianReveal>
        </div>

        <div className="mt-24 hidden lg:block">
          <div className="relative grid grid-cols-3 gap-12">
            <div className="absolute left-0 right-0 top-[0.25rem]">
              <div className="mc-timeline-line" />
            </div>

            {steps.map((step, i) => (
              <MeridianReveal key={step.number} delay={i * 0.1}>
                <div className="relative pt-10">
                  <div className="mc-step-dot absolute left-0 top-0" />
                  <span className="text-[0.625rem] font-medium tracking-[0.24em] text-[var(--mc-gold)]">
                    {step.number}
                  </span>
                  <h3 className="font-display mt-5 text-[1.625rem] tracking-[0.02em]">
                    {step.title}
                  </h3>
                  <p className="mc-body-sm mt-5 max-w-xs">{step.description}</p>
                </div>
              </MeridianReveal>
            ))}
          </div>
        </div>

        <div className="mt-20 space-y-0 lg:hidden">
          {steps.map((step, i) => (
            <MeridianReveal key={step.number} delay={i * 0.08}>
              <div className="relative flex gap-7 pb-14 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="mc-step-dot shrink-0" />
                  {i < steps.length - 1 && (
                    <div
                      className="mt-3 w-px flex-1 opacity-40"
                      style={{
                        background:
                          "linear-gradient(180deg, var(--mc-gold-dark) 0%, var(--mc-steel) 100%)",
                      }}
                    />
                  )}
                </div>
                <div className="pb-2">
                  <span className="text-[0.625rem] font-medium tracking-[0.24em] text-[var(--mc-gold)]">
                    {step.number}
                  </span>
                  <h3 className="font-display mt-3 text-xl tracking-[0.02em]">
                    {step.title}
                  </h3>
                  <p className="mc-body-sm mt-4">{step.description}</p>
                </div>
              </div>
            </MeridianReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
