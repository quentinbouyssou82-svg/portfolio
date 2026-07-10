"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/margeo/reveal";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";

export function FinalCta() {
  return (
    <section className="relative py-24 sm:py-32">
      <Reveal className="relative mx-auto max-w-2xl px-5 text-center">
        <h2 className="text-gradient text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Ta prochaine course mérite un vrai calcul.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-mg-muted sm:text-lg">
          Rejoins la beta gratuitement. Première analyse en moins de 2 minutes.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={margeoRoutes.signup}>
            <Button size="lg" className="landing-cta-primary min-h-12 w-full min-w-[240px]">
              Commencer gratuitement
              <ArrowRight />
            </Button>
          </Link>
          <Link href={margeoRoutes.login}>
            <Button variant="secondary" size="lg" className="min-h-12 w-full min-w-[200px] sm:w-auto">
              J&apos;ai déjà un compte
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-mg-faint">
          Uber Eats · Deliveroo · Stuart · Amazon Flex
        </p>
      </Reveal>
    </section>
  );
}
