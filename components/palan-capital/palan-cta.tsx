"use client";

import { contactContent, homeContent } from "@/lib/palan-capital/content";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/palan-capital/constants";
import { PalanScrollReveal } from "./palan-scroll-reveal";

const { cta } = homeContent;

export function PalanCta() {
  return (
    <section id="contact" className="ax-section ax-cta relative overflow-hidden">
      <div className="ax-cta-frame" aria-hidden />
      <div className="ax-cta-glow" aria-hidden />

      <div className="apex-wrap relative z-10 text-center">
        <PalanScrollReveal>
          <p className="ax-label">{contactContent.tag}</p>
          <h2 className="ax-headline-lg mx-auto mt-10 max-w-2xl leading-[1.08]">
            {contactContent.title[0]}{" "}
            <em className="ax-gold-text italic">{contactContent.title[1]}</em>{" "}
            {contactContent.title[2]}
          </h2>
          <p className="ax-body mx-auto mt-8 max-w-md">{contactContent.intro}</p>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="ax-btn ax-btn-gold inline-flex">
              {cta.button}
            </a>
            <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="ax-btn ax-btn-ghost inline-flex">
              {PUBLIC_CONTACT_EMAIL}
            </a>
          </div>
          <p className="ax-body-sm mx-auto mt-8 max-w-sm">
            {contactContent.info[1].value}
          </p>
        </PalanScrollReveal>
      </div>
    </section>
  );
}
