import type { Metadata } from "next";
import { PalanContactForm } from "@/components/palan-capital/palan-contact-form";
import { contactContent } from "@/lib/palan-capital/content";

export const metadata: Metadata = {
  title: "Contact",
  description: contactContent.meta.description,
};

export default function ContactPage() {
  const c = contactContent;

  return (
    <div className="grid lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <section className="bg-[var(--palan-navy)] px-5 py-16 md:px-12 md:py-24 lg:px-16">
        <div className="palan-section-tag mb-8 text-[var(--palan-gold)]/80">{c.tag}</div>
        <h1 className="font-display mb-6 max-w-md text-[clamp(2rem,3.5vw,3rem)] font-light leading-[1.15] text-white">
          {c.title[0]}
          <br />
          <em className="text-[var(--palan-gold)] italic">{c.title[1]}</em>
          <br />
          {c.title[2]}
        </h1>
        <p className="mb-10 max-w-md text-[0.85rem] leading-[1.9] text-white/55">{c.intro}</p>

        <div className="space-y-5 border-t border-[var(--palan-line)] pt-8">
          {c.info.map((line) => (
            <div key={line.label}>
              <span className="mb-1 block text-[0.62rem] uppercase tracking-[0.14em] text-[var(--palan-gold)]/80">
                {line.label}
              </span>
              {line.label === "Email" ? (
                <a
                  href={`mailto:${line.value}`}
                  className="text-[0.8rem] text-white/55 transition-colors hover:text-white"
                >
                  {line.value}
                </a>
              ) : (
                <span className="text-[0.8rem] text-white/55">{line.value}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--palan-ivory)] px-5 py-16 md:px-12 md:py-24 lg:px-16">
        <h2 className="font-display mb-10 text-[1.5rem] font-normal text-[var(--palan-navy)]">{c.formTitle}</h2>
        <PalanContactForm />
      </section>
    </div>
  );
}
