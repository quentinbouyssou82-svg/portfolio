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

      <div className="palan-wrap max-w-2xl py-16 md:py-20">
        {legalContent.sections.map((section) => (
          <section key={section.title} id={section.id} className="mb-12">
            <h2 className="font-serif mb-4 text-2xl font-normal text-[var(--navy)]">{section.title}</h2>
            <p className="pc-body whitespace-pre-line">{section.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}
