import type { Metadata } from "next";
import { PalanPageHero } from "@/components/palan-capital/palan-sections";
import { legalContent } from "@/lib/palan-capital/content";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: legalContent.meta.description,
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PalanPageHero eyebrow="Informations légales" title={["Mentions légales"]} />

      <div className="mx-auto max-w-3xl px-5 py-16 md:px-10 md:py-20 lg:px-16">
        {legalContent.sections.map((section) => (
          <section key={section.title} id={section.id} className="mb-12 last:mb-0">
            <h2 className="font-display mb-4 mt-8 text-[1.8rem] font-normal text-[var(--palan-navy)] first:mt-0">
              {section.title}
            </h2>
            <p className="whitespace-pre-line text-[0.9rem] leading-[1.95] text-[var(--palan-gray)]">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </>
  );
}
