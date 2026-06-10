import Link from "next/link";
import { PalanReveal } from "@/components/palan-capital/palan-reveal";
import { homeContent } from "@/lib/palan-capital/content";
import { PALAN_BASE } from "@/lib/palan-capital/constants";

export default function PalanCapitalHomePage() {
  const { hero, jurisdictions, expertises, convictions, audiences, cta } = homeContent;

  return (
    <>
      <section className="flex min-h-[calc(100vh-4.5rem)] flex-col justify-end bg-[var(--palan-navy)] px-5 pb-12 pt-28 md:px-10 md:pb-20 md:pt-32 lg:px-16">
        <div className="mx-auto w-full max-w-[90rem]">
          <div className="palan-gold-line mb-8 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.22em] text-[var(--palan-gold)]">
            {hero.eyebrow}
          </div>

          <h1 className="font-display mb-10 max-w-4xl text-[clamp(2.25rem,7vw,6.5rem)] font-light leading-[1.02] text-white">
            {hero.title[0]}
            <br />
            <em className="text-[var(--palan-gold)] italic">{hero.title[1]}</em>
          </h1>

          <div className="flex flex-col gap-8 border-t border-[var(--palan-line)] pt-8 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-sm text-[0.8rem] leading-[1.9] tracking-wide text-white/55">
              {hero.subtitle.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={hero.ctas[0].href}
                className="bg-[var(--palan-gold)] px-8 py-3 text-center text-[0.68rem] font-medium uppercase tracking-[0.13em] text-white transition-opacity hover:opacity-85"
              >
                {hero.ctas[0].label}
              </Link>
              <Link
                href={hero.ctas[1].href}
                className="border border-white/25 px-8 py-3 text-center text-[0.68rem] uppercase tracking-[0.13em] text-white/70 transition-colors hover:border-[var(--palan-gold)] hover:text-white"
              >
                {hero.ctas[1].label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid bg-white md:grid-cols-3">
        {jurisdictions.map((j) => (
          <div
            key={j.name}
            className="border-b border-[var(--palan-line)] px-5 py-10 md:border-b-0 md:border-r md:px-10 md:py-14 lg:px-16 last:md:border-r-0"
          >
            <div className="mb-3 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--palan-gold)]">{j.label}</div>
            <div className="font-display mb-3 text-[clamp(2.5rem,5vw,4.5rem)] font-light leading-none text-[var(--palan-navy)]">
              {j.name}
            </div>
            <p className="whitespace-pre-line text-[0.68rem] uppercase leading-[1.7] tracking-[0.1em] text-[var(--palan-gray)]">
              {j.detail}
            </p>
          </div>
        ))}
      </section>

      <PalanReveal>
        <section className="border-b border-[var(--palan-line)] bg-white px-5 py-16 md:px-10 md:py-24 lg:px-16">
          <div className="mx-auto max-w-[90rem]">
            <div className="palan-section-tag mb-10">{expertises.tag}</div>
            <div className="mb-12 grid gap-10 lg:mb-16 lg:grid-cols-[1fr_1.6fr] lg:items-end lg:gap-28">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-tight text-[var(--palan-navy)]">
                {expertises.title[0]}{" "}
                <em className="text-[var(--palan-gold)] italic">{expertises.title[1]}</em>
              </h2>
              <p className="text-[0.9rem] leading-[1.95] text-[var(--palan-gray)]">{expertises.intro}</p>
            </div>

            <div className="grid gap-px bg-[rgba(201,168,76,0.15)] md:grid-cols-2">
              {expertises.items.map((item) => (
                <article key={item.num} className="flex flex-col bg-white p-8 md:p-12">
                  <div className="font-display mb-6 text-[2.5rem] font-light leading-none text-[var(--palan-gold)]">
                    {item.num}
                  </div>
                  <h3 className="font-display text-[1.65rem] font-medium leading-tight text-[var(--palan-navy)]">
                    {item.title}
                  </h3>
                  <p className="mb-6 mt-2 text-[0.7rem] uppercase tracking-[0.15em] text-[var(--palan-gold)]">
                    {item.en}
                  </p>
                  <p className="mb-6 flex-1 text-[0.875rem] leading-[1.85] text-[var(--palan-gray)]">{item.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[var(--palan-line)] bg-[var(--palan-ivory)] px-3 py-1.5 text-[0.65rem] tracking-wide text-[var(--palan-navy)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </PalanReveal>

      <PalanReveal>
        <section className="bg-[var(--palan-ivory)] px-5 py-16 md:px-10 md:py-24 lg:px-16">
          <div className="mx-auto max-w-[90rem]">
            <div className="palan-section-tag mb-10">{convictions.tag}</div>
            <div className="mb-12 grid gap-10 lg:mb-16 lg:grid-cols-[1fr_1.6fr] lg:items-end lg:gap-28">
              <h2 className="font-display text-[clamp(1.75rem,3.5vw,3rem)] font-light leading-tight text-[var(--palan-navy)]">
                {convictions.title[0]}{" "}
                <em className="text-[var(--palan-gold)] italic">{convictions.title[1]}</em>
              </h2>
              <p className="text-[0.9rem] leading-[1.95] text-[var(--palan-gray)]">{convictions.intro}</p>
            </div>

            <div className="border-t border-[var(--palan-line)]">
              {convictions.items.map((item) => (
                <article
                  key={item.num}
                  className="grid gap-4 border-b border-[var(--palan-line)] py-8 md:grid-cols-[4.5rem_1.2fr_2fr] md:gap-8 md:py-10"
                >
                  <div className="font-display text-[3rem] font-light leading-none text-[var(--palan-navy)]/10">
                    {item.num}
                  </div>
                  <h3 className="font-display pt-1 text-[1.2rem] font-medium leading-snug text-[var(--palan-navy)]">
                    {item.name}
                  </h3>
                  <p className="text-[0.85rem] leading-[1.95] text-[var(--palan-gray)]">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </PalanReveal>

      <PalanReveal>
        <section className="bg-[var(--palan-navy)] px-5 py-16 md:px-10 md:py-24 lg:px-16">
          <div className="mx-auto max-w-[90rem]">
            <div className="mb-4 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--palan-gold)]/70">
              {audiences.tag}
              <span className="h-px w-8 bg-[var(--palan-gold)]/40" />
            </div>
            <h2 className="font-display mb-12 text-[clamp(1.75rem,3.5vw,3rem)] font-light text-white">
              {audiences.title[0]}{" "}
              <em className="text-[var(--palan-gold)] italic">{audiences.title[1]}</em>
            </h2>

            <div className="grid gap-px bg-[rgba(201,168,76,0.1)] md:grid-cols-2">
              {audiences.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group block bg-[var(--palan-navy)] p-8 transition-colors hover:bg-[#0f1e38] md:p-12"
                >
                  <span className="font-display mb-6 block text-[0.85rem] tracking-[0.1em] text-[var(--palan-gold)]">
                    {item.num}
                  </span>
                  <h3 className="font-display mb-4 text-[1.65rem] font-normal leading-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mb-8 text-[0.8rem] leading-[1.9] text-white/45">{item.text}</p>
                  <span className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--palan-gold)]">
                    Découvrir →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </PalanReveal>

      <section className="flex flex-col items-start justify-between gap-8 bg-[var(--palan-gold)] px-5 py-14 md:flex-row md:items-center md:px-10 md:py-20 lg:px-16">
        <p className="font-display max-w-xl text-[clamp(1.35rem,2.5vw,2.25rem)] font-light leading-snug text-white">
          Une question, <em className="italic">un dossier</em>, une opportunité.
          <br />
          {cta.sub}
        </p>
        <Link
          href={`${PALAN_BASE}/contact`}
          className="shrink-0 bg-white px-8 py-3 text-[0.68rem] font-medium uppercase tracking-[0.13em] text-[var(--palan-navy)] transition-opacity hover:opacity-80"
        >
          {cta.button}
        </Link>
      </section>
    </>
  );
}
