"use client";

import { PUBLIC_CONTACT_EMAIL } from "@/lib/palan-capital/constants";
import { useApexLocale } from "./apex-locale-provider";
import { ApexStoryHeadline } from "./apex-story-headline";

export function ApexCta() {
  const { t } = useApexLocale();
  const { contact } = t;

  return (
    <section id="contact" data-ax-story-section className="ax-section ax-cta relative overflow-hidden">
      <div className="ax-cta-frame" aria-hidden />
      <div className="ax-cta-glow" aria-hidden />

      <div className="apex-wrap ax-story-focus relative z-10 text-center">
        <p className="ax-label" data-ax-reveal>
          {contact.tag}
        </p>
        <ApexStoryHeadline
          className="ax-headline-lg mx-auto mt-10 max-w-2xl leading-[1.08]"
          lines={[
            contact.title[0],
            <em key="em" className="ax-gold-text italic">
              {contact.title[1]}
            </em>,
            contact.title[2],
          ]}
        />
        <p className="ax-body mx-auto mt-8 max-w-md" data-ax-reveal>
          {contact.intro}
        </p>
        <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row" data-ax-stagger>
          <a
            href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
            data-ax-stagger-item
            className="ax-btn ax-btn-gold inline-flex"
          >
            {contact.button}
          </a>
          <a
            href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
            data-ax-stagger-item
            className="ax-btn ax-btn-ghost inline-flex"
          >
            {PUBLIC_CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </section>
  );
}
