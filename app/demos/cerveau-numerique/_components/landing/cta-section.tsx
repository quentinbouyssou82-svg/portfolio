import { ArrowRight } from "lucide-react";
import { NeonButtonLink } from "../ui/neon-button";
import { Reveal } from "../ui/reveal";

const CN = "/demos/cerveau-numerique";

export function CtaSection() {
  return (
    <section className="relative px-6 pb-28 pt-8 sm:pb-36">
      <Reveal className="relative mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-gradient-to-b from-white/[0.05] to-white/[0.015] px-6 py-16 text-center sm:px-16 sm:py-20">
          {/* Inner horizon glow mirroring the page background. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 90% at 50% 118%, rgba(96, 165, 250, 0.22), rgba(139, 122, 246, 0.08) 55%, transparent 80%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 bottom-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(147, 197, 253, 0.45), transparent)",
            }}
          />

          <h2 className="relative text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Prêt à alléger ta charge mentale ?
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-[var(--cn-muted)]">
            5 minutes d&apos;onboarding. Ensuite, ton cerveau numérique
            travaille pour toi.
          </p>
          <div className="relative mt-9 flex justify-center">
            <NeonButtonLink href={`${CN}/onboarding`}>
              Commencer gratuitement
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </NeonButtonLink>
          </div>
          <p className="relative mt-5 text-xs text-[var(--cn-ghost)]">
            Gratuit, sans carte bancaire.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
