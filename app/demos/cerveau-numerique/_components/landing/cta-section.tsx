import { ArrowRight } from "lucide-react";
import { ButtonLink } from "../ui/button";
import { Reveal } from "../ui/reveal";

const CN = "/demos/cerveau-numerique";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 60% at 50% 100%, rgba(79,158,255,0.14), transparent 70%)",
        }}
        aria-hidden
      />
      <Reveal className="relative mx-auto max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Prêt à alléger ta charge mentale ?
        </h2>
        <p className="mt-3 text-[var(--cn-muted)]">
          5 minutes d&apos;onboarding. Ensuite, ton cerveau numérique travaille
          pour toi.
        </p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href={`${CN}/onboarding`} size="lg" className="group">
            Commencer gratuitement
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}
