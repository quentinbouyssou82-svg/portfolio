"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { Reveal } from "@/components/margeo/reveal";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";

const PLATFORMS = ["Uber Eats", "Deliveroo", "Stuart", "Amazon Flex"] as const;

export function FinalCta() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-36">
      <div className="section-bridge mb-16 sm:mb-20" aria-hidden />
      <Reveal className="relative mx-auto max-w-3xl px-5">
        <div className="final-cta-stage px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="final-cta-glow" aria-hidden />
          <div className="final-cta-noise" aria-hidden />
          <div className="relative z-[1]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-mg-accent/30 bg-mg-accent-soft/80 px-3 py-1 text-[11px] font-semibold text-mg-accent backdrop-blur-sm">
              <Sparkles className="size-3" />
              Beta ouverte
            </span>
            <h2 className="text-gradient mt-5 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Arrête de deviner. Sais combien tu gagnes.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-mg-muted sm:text-lg">
              Compte gratuit. Première analyse en 30 secondes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={margeoRoutes.signup}>
                <Button size="lg" className="landing-cta-primary min-h-12 w-full min-w-[240px]">
                  Commencer gratuitement
                  <ArrowRight />
                </Button>
              </Link>
              <Link href={margeoRoutes.login}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="landing-cta-secondary min-h-12 w-full min-w-[200px] sm:w-auto"
                >
                  J&apos;ai déjà un compte
                </Button>
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              {PLATFORMS.map((platform) => (
                <PlatformLogo key={platform} platform={platform} size="xs" showLabel />
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
