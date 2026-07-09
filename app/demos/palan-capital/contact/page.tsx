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
    <div className="grid lg:min-h-[calc(100vh-4.25rem)] lg:grid-cols-2">
      <section className="bg-[var(--navy)] px-5 py-16 md:px-12 md:py-24 lg:px-16">
        <div className="max-w-md">
          <p className="pc-eyebrow mb-8 !text-[var(--gold)]">{c.tag}</p>
          <h1 className="font-serif text-[clamp(2rem,3.5vw,2.75rem)] font-light leading-[1.15] text-[var(--ivory)]">
            {c.title[0]}
            <br />
            {c.title[1]}
            <br />
            {c.title[2]}
          </h1>
          <p className="mt-6 text-[0.875rem] leading-[1.9] text-[var(--ivory)]/75">{c.intro}</p>

          <div className="mt-12 space-y-6 border-t border-white/10 pt-10">
            {c.info.map((line) => (
              <div key={line.label}>
                <span className="pc-label text-[var(--gold)]">{line.label}</span>
                {line.label === "Email" ? (
                  <a
                    href={`mailto:${line.value}`}
                    className="mt-1 block text-[0.875rem] text-[var(--ivory)]/80 hover:text-[var(--gold)]"
                  >
                    {line.value}
                  </a>
                ) : (
                  <span className="mt-1 block text-[0.875rem] text-[var(--ivory)]/80">{line.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--ivory)] px-5 py-16 md:px-12 md:py-24 lg:px-16">
        <h2 className="font-serif mb-10 text-2xl font-normal text-[var(--navy)]">{c.formTitle}</h2>
        <PalanContactForm />
      </section>
    </div>
  );
}
