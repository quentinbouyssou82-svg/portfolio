import { homeContent } from "@/lib/palan-capital/content";
import { PalanScrollReveal } from "./palan-scroll-reveal";

const { audiences } = homeContent;

export function PalanAudiences() {
  return (
    <section id="audiences" className="ax-section relative">
      <span className="ax-section-watermark" aria-hidden>
        03
      </span>
      <div className="apex-wrap">
        <div className="ax-divider mb-20 md:mb-28" />

        <PalanScrollReveal>
          <p className="ax-label">{audiences.tag}</p>
          <h2 className="ax-headline-lg mt-8 max-w-xl">
            {audiences.title[0]}{" "}
            <em className="ax-gold-text italic">{audiences.title[1]}</em>
          </h2>
        </PalanScrollReveal>

        <div className="ax-stat-bento mt-20">
          {audiences.items.map((item, i) => (
            <PalanScrollReveal key={item.title} delay={i * 0.07}>
              <a href="#" className="ax-audience-card ax-stat-card">
                <span className="ax-audience-num">{item.num.split("·")[0]?.trim()}</span>
                <h3 className="ax-audience-title mt-4">{item.title}</h3>
                <p className="ax-body-sm mt-4">{item.text}</p>
              </a>
            </PalanScrollReveal>
          ))}
        </div>

        <PalanScrollReveal delay={0.1} className="mt-20">
          <blockquote className="ax-quote mx-auto max-w-2xl text-center">
            Chaque mission commence par un entretien de cadrage. Confidentiel, sans engagement.
          </blockquote>
        </PalanScrollReveal>
      </div>
    </section>
  );
}
