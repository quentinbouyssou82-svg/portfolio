"use client";

import { MeridianReveal } from "./meridian-reveal";

export function MeridianCta() {
  return (
    <section id="contact" className="relative overflow-hidden py-32 md:py-40">
      <div className="absolute inset-0 bg-[var(--mc-bg-depth)]" />
      <div className="mc-cta-glow" />
      <div className="mc-grain" />

      <div className="meridian-wrap relative z-10 text-center">
        <MeridianReveal duration={1.05}>
          <p className="mc-eyebrow justify-center before:hidden">Contact</p>
          <h2 className="font-display mc-display-md mx-auto mt-10 max-w-2xl leading-[1.12]">
            Construisons une stratégie financière{" "}
            <em className="mc-gold-text not-italic">sur mesure.</em>
          </h2>
          <p className="mc-body mx-auto mt-8 max-w-sm">
            Premier échange confidentiel, sans engagement. Réponse sous 48 heures
            ouvrées.
          </p>
          <div className="mt-14">
            <a
              href="mailto:contact@meridian-capital.fr"
              className="mc-btn mc-btn-gold inline-flex"
            >
              Prendre rendez-vous
            </a>
          </div>
        </MeridianReveal>
      </div>
    </section>
  );
}
