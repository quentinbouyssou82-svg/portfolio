import { homeContent } from "@/lib/palan-capital/content";
import { PalanScrollReveal } from "./palan-scroll-reveal";

const { convictions } = homeContent;

export function PalanConvictions() {
  return (
    <section id="convictions" className="ax-section ax-section-alt relative">
      <span className="ax-section-watermark" aria-hidden>
        02
      </span>
      <div className="ax-section-glow" aria-hidden />

      <div className="apex-wrap relative">
        <div className="ax-divider mb-20 md:mb-28" />

        <div className="grid gap-20 lg:grid-cols-2 lg:gap-32">
          <PalanScrollReveal>
            <p className="ax-label">{convictions.tag}</p>
            <h2 className="ax-headline-lg mt-8 max-w-md">
              {convictions.title[0]}{" "}
              <em className="ax-gold-text italic">{convictions.title[1]}</em>
            </h2>
            <p className="ax-body mt-8 max-w-sm">{convictions.intro}</p>
          </PalanScrollReveal>

          <div className="ax-timeline relative">
            {convictions.items.map((item, i) => (
              <PalanScrollReveal key={item.num} delay={i * 0.08}>
                <div className="ax-timeline-step">
                  <div className="ax-timeline-dot" />
                  <span className="ax-label text-[0.5rem]">{item.num}</span>
                  <h3 className="font-display mt-4 text-[1.625rem] tracking-[0.01em] md:text-[1.875rem]">
                    {item.name}
                  </h3>
                  <p className="ax-body-sm mt-4 max-w-md">{item.text}</p>
                </div>
              </PalanScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
