"use client";

import { ArrowRight, Check, FlaskConical, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { Reveal } from "@/components/margeo/reveal";
import { Button } from "@/components/margeo/ui/button";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import { margeoRoutes } from "@/lib/margeo/routes";

const UNLOCKED = [
  "Analyses illimitées",
  "Historique complet",
  "Dashboard & objectifs",
  "Zones rentables",
  "Insights & exports",
] as const;

/**
 * Page Premium en mode app bêta — pas de paywall, message de gratitude.
 */
export function BetaUnlockedPremiumPage() {
  return (
    <div className="mx-auto max-w-lg space-y-8 pb-10 pt-2">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-mg-go/30 bg-mg-go-soft px-3.5 py-1.5 text-xs font-semibold tracking-[0.16em] text-mg-go uppercase">
          <FlaskConical className="size-3.5" />
          Bêta privée
        </span>
        <h1 className="text-gradient mt-5 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Fonctionnalités débloquées
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-mg-muted text-pretty">
          Merci de participer à la bêta privée.
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="rounded-2xl border border-mg-border bg-[var(--mg-surface-muted)] p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-mg-foreground">
            <Sparkles className="size-4 text-mg-accent" />
            Tout est offert pendant cette phase de test
          </p>
          <p className="mt-2 text-sm leading-relaxed text-mg-muted">
            Ton rôle : utiliser {PRODUCT_NAME} normalement et nous signaler les
            problèmes rencontrés.
          </p>
          <ul className="mt-5 space-y-2.5">
            {UNLOCKED.map((item) => (
              <li
                key={item}
                className="flex gap-2.5 text-sm text-mg-foreground/90"
              >
                <Check className="mt-0.5 size-4 shrink-0 text-mg-go" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal delay={0.1} className="space-y-3">
        <Link href={margeoRoutes.analyse} className="block">
          <Button className="app-cta-primary w-full min-h-12">
            Continuer les tests
            <ArrowRight />
          </Button>
        </Link>
        <Link href={margeoRoutes.retour} className="block">
          <Button variant="secondary" className="w-full min-h-11">
            Section Retour
          </Button>
        </Link>
        <p className="flex items-center justify-center gap-1.5 pt-2 text-xs text-mg-faint">
          <Heart className="size-3.5 text-mg-accent" aria-hidden />
          Merci de construire {PRODUCT_NAME} avec nous
        </p>
      </Reveal>
    </div>
  );
}
