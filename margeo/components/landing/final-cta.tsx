"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(700px circle at 50% 120%, rgba(52,211,153,0.16), transparent 60%)",
        }}
        aria-hidden
      />
      <Reveal className="relative mx-auto max-w-2xl px-5 text-center">
        <h2 className="text-gradient text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Arrête de rouler à perte.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">
          Ta prochaine proposition de course mérite un vrai calcul. Margeo le
          fait pour toi, gratuitement.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/analyse">
            <Button size="lg">
              Commencer gratuitement
              <ArrowRight />
            </Button>
          </Link>
          <Link href="/premium">
            <Button variant="outline" size="lg">
              Découvrir Premium
            </Button>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
