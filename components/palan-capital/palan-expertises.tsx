import { homeContent } from "@/lib/palan-capital/content";
import { PalanScrollReveal } from "./palan-scroll-reveal";

const { expertises } = homeContent;

export function PalanExpertises() {
  return (
    <section id="expertises" className="ax-section relative">
      <span className="ax-section-watermark" aria-hidden>
        01
      </span>
      <div className="apex-wrap">
        <div className="ax-divider mb-20 md:mb-28" />

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_1.7fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <PalanScrollReveal>
              <p className="ax-label">{expertises.tag}</p>
              <h2 className="ax-headline-lg mt-8">
                {expertises.title[0]}{" "}
                <em className="ax-gold-text italic">{expertises.title[1]}</em>
              </h2>
              <p className="ax-body mt-8 max-w-sm">{expertises.intro}</p>
            </PalanScrollReveal>
          </div>

          <div className="ax-card-stack space-y-4">
            {expertises.items.map((item, i) => (
              <PalanScrollReveal key={item.num} delay={i * 0.06}>
                <article className="ax-card group p-8 md:p-10">
                  <span className="ax-card-watermark" aria-hidden>
                    {item.num}
                  </span>
                  <div className="flex items-start justify-between gap-4">
                    <span className="ax-card-index">{item.num}</span>
                    <span className="ax-card-en">{item.en}</span>
                  </div>
                  <h3 className="font-display mt-4 text-[1.35rem] tracking-[0.01em] md:text-[1.5rem]">
                    {item.title}
                  </h3>
                  <p className="ax-body-sm mt-4 max-w-lg">{item.desc}</p>
                  <div className="ax-card-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="ax-card-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="ax-card-shine" aria-hidden />
                </article>
              </PalanScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
