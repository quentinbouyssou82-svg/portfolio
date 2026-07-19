"use client";

import { Star } from "lucide-react";
import { Reveal } from "@/components/margeo/reveal";

const REVIEWS = [
  {
    quote:
      "Je pensais gagner correctement avant... en réalité je refusais presque aucune mauvaise course.",
    name: "Thomas",
    platform: "Uber Eats",
    city: "Toulouse",
    seniority: "3 ans",
  },
  {
    quote: "Je regarde Uberly avant chaque commande, ça prend deux secondes.",
    name: "Sarah",
    platform: "Deliveroo",
    city: "Lyon",
    seniority: "18 mois",
  },
  {
    quote:
      "Le verdict évite de réfléchir quand Uber laisse seulement quelques secondes.",
    name: "Karim",
    platform: "Uber Eats",
    city: "Paris",
    seniority: "2 ans",
  },
  {
    quote:
      "J'ai arrêté d'accepter au feeling. Le net, c'est souvent loin du chiffre affiché.",
    name: "Nina",
    platform: "Stuart",
    city: "Bordeaux",
    seniority: "1 an",
  },
] as const;

/** Section réassurance sobre — avant FAQ. */
export function TrustSection() {
  return (
    <section
      id="confiance"
      className="trust-section relative scroll-mt-24 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-4xl px-5">
        <Reveal className="text-center">
          <div className="inline-flex items-center gap-1.5 text-mg-check">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="size-4 fill-current"
                strokeWidth={0}
                aria-hidden
              />
            ))}
            <span className="ml-1.5 text-sm font-semibold tracking-tight text-mg-foreground">
              4,9 / 5
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mg-muted sm:text-base">
            Déjà utilisé par des dizaines de livreurs pendant la bêta.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.quote} delay={i * 0.06}>
              <blockquote className="trust-card h-full rounded-2xl border border-mg-border bg-mg-card/80 px-5 py-4">
                <p className="text-sm leading-relaxed text-mg-foreground">
                  « {review.quote} »
                </p>
                <footer className="mt-3 text-[11px] font-medium tracking-wide text-mg-faint">
                  {review.name} · {review.platform} · {review.city}
                  <span className="text-mg-faint/80"> · {review.seniority}</span>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
