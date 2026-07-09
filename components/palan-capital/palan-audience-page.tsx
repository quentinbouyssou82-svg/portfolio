import type { AudiencePageContent } from "@/lib/palan-capital/content";
import { PalanCtaBand, PalanPageHero, PalanSplitTitle } from "./palan-sections";

export function PalanAudiencePage({ content }: { content: AudiencePageContent }) {
  return (
    <>
      <PalanPageHero eyebrow={content.hero.eyebrow} title={content.hero.title} intro={content.hero.intro} />

      {content.sections.map((section, index) => (
        <section
          key={section.eyebrow}
          className={`py-16 md:py-24 ${index % 2 === 0 ? "bg-[var(--ivory)]" : "bg-[var(--white)]"}`}
        >
          <div className="palan-wrap grid gap-12 lg:grid-cols-[1fr_1.8fr]">
            <div>
              <p className="pc-eyebrow mb-5">{section.eyebrow}</p>
              <PalanSplitTitle parts={section.title} />
            </div>

            <div>
              {section.paragraphs?.map((p) => (
                <p key={p.slice(0, 40)} className="pc-body mb-6">
                  {p}
                </p>
              ))}

              {section.list && (
                <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                  {section.list.map((item) => (
                    <div key={item.num} className="grid gap-4 py-8 sm:grid-cols-[3.5rem_1fr]">
                      <span className="font-serif text-xl text-[var(--gold)]">{item.num}</span>
                      <div>
                        <h3 className="font-serif text-lg text-[var(--navy)]">{item.name}</h3>
                        <p className="pc-body mt-2 !text-[0.875rem]">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.tools?.map((tool) => (
                <p key={tool.label} className="pc-body mb-5">
                  <strong className="font-medium text-[var(--navy)]">{tool.label}</strong> — {tool.text}
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
