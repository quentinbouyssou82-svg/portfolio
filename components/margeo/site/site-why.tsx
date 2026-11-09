import { Reveal } from "./reveal";

const POINTS = [
  {
    title: "Rapide",
    body: "Pensé pour le rythme d’une tournée — pas pour un dashboard.",
  },
  {
    title: "Verdict clair",
    body: "Go, Check ou Stop. Les mêmes couleurs que dans l’app.",
  },
  {
    title: "Sur iPhone",
    body: "Back Tap et Centre de contrôle pour lancer sans friction.",
  },
] as const;

export function SiteWhy() {
  return (
    <section className="bg-[#F2F2F7] px-5 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="text-center text-[1.75rem] font-bold tracking-[-0.03em] text-black sm:text-[2.1rem]">
            Le même langage que l’app
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-[15px] leading-relaxed text-[#636366]">
            Fond clair, actions noires, verdicts colorés. Driveely web et
            Driveely iPhone, une seule marque.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <span className="rounded-full bg-[#059669]/12 px-4 py-2 text-[13px] font-semibold text-[#059669]">
              Accepter
            </span>
            <span className="rounded-full bg-[#B45309]/12 px-4 py-2 text-[13px] font-semibold text-[#B45309]">
              Vérifier
            </span>
            <span className="rounded-full bg-[#DC2626]/12 px-4 py-2 text-[13px] font-semibold text-[#DC2626]">
              Refuser
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={0.05 * i}>
              <div className="h-full rounded-[1.25rem] border border-black/[0.06] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <h3 className="text-[1.05rem] font-bold text-black">
                  {p.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#636366]">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10 flex justify-center">
            <span className="inline-flex min-h-12 min-w-[220px] items-center justify-center rounded-full bg-black px-8 text-[15px] font-semibold text-white">
              Continuer
            </span>
          </div>
          <p className="mt-3 text-center text-[12px] text-[#8E8E93]">
            Même bouton primaire que dans Driveely
          </p>
        </Reveal>
      </div>
    </section>
  );
}
