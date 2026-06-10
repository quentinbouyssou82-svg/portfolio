import type { AudiencePageContent } from "@/lib/palan-capital/content";
import { PalanCtaBand, PalanPageHero, PalanSplitTitle } from "./palan-sections";

export function PalanAudiencePage({ content }: { content: AudiencePageContent }) {
  return (
    <>
      <PalanPageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
      />

      {content.sections.map((section, index) => (
        <section
          key={section.eyebrow}
          className={`px-5 py-16 md:px-10 md:py-24 lg:px-16 ${
            index % 2 === 0 ? "bg-[var(--palan-ivory)]" : "bg-white"
          }`}
        >
          <div className="mx-auto grid max-w-[90rem] gap-10 lg:grid-cols-[1fr_2fr] lg:gap-24">
            <div>
              <div className="palan-detail-eyebrow">{section.eyebrow}</div>
              <PalanSplitTitle parts={section.title} />
            </div>

            <div>
              {section.paragraphs?.map((p) => (
                <p key={p.slice(0, 40)} className="mb-6 text-[0.9rem] leading-[1.95] text-[var(--palan-gray)]">
                  {p}
                </p>
              ))}

              {section.list && (
                <div className="mt-2 border-t border-[var(--palan-line)]">
                  {section.list.map((item) => (
                    <div
                      key={item.num}
                      className="grid gap-4 border-b border-[var(--palan-line)] py-6 sm:grid-cols-[4rem_1fr]"
                    >
                      <div className="font-display text-[1.3rem] font-light text-[var(--palan-gold)]">
                        {item.num}
                      </div>
                      <div>
                        <div className="font-display mb-2 text-[1.05rem] font-medium text-[var(--palan-navy)]">
                          {item.name}
                        </div>
                        <p className="text-[0.85rem] leading-[1.85] text-[var(--palan-gray)]">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.tools?.map((tool) => (
                <p key={tool.label} className="mb-6 text-[0.9rem] leading-[1.95] text-[var(--palan-gray)]">
                  <strong className="font-medium text-[var(--palan-navy)]">{tool.label}</strong>
                  {" — "}
                  {tool.text}
                </p>
              ))}
            </div>
          </div>
        </section>
      ))}

      <PalanCtaBand lines={content.cta.text} button={content.cta.button} />
    </>
  );
}
