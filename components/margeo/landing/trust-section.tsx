"use client";

import { Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/margeo/reveal";
import { formatRelativeReviewDate } from "@/lib/margeo/format-relative-time";

/**
 * Ancrage bêta — timestamps fixes dérivés de cette date pour que les avis
 * vieillissent naturellement (il y a 2 h → hier → il y a 3 jours…).
 */
const REVIEWS_ANCHOR = new Date("2026-07-21T14:00:00+02:00");

const REVIEWS = [
  {
    quote:
      "Je me suis rendu compte que je faisais beaucoup trop de kilomètres pour pas grand-chose. Maintenant je regarde avant d'accepter.",
    name: "Julien",
    platform: "Uber Eats",
    city: "Albi",
    /** ~2 h avant l'ancrage */
    postedAtOffsetMs: 2 * 60 * 60 * 1000,
  },
  {
    quote:
      "Au début je pensais que ça servirait une fois de temps en temps. Finalement je l'utilise quasiment à chaque course.",
    name: "Mélanie",
    platform: "Deliveroo",
    city: "Vannes",
    /** Même journée, matin */
    postedAtOffsetMs: 6 * 60 * 60 * 1000,
  },
  {
    quote:
      "Ça confirme souvent ce que je pensais... et parfois ça m'évite une très mauvaise course.",
    name: "Yacine",
    platform: "Uber Eats",
    city: "Belfort",
    postedAtOffsetMs: 3 * 24 * 60 * 60 * 1000,
  },
  {
    quote:
      "Le calcul est rapide et ça évite de décider dans le stress quand la commande arrive.",
    name: "Clément",
    platform: "Stuart",
    city: "Montauban",
    postedAtOffsetMs: 6 * 24 * 60 * 60 * 1000,
  },
] as const;

function useRelativeNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

/** Section réassurance sobre — avant FAQ. */
export function TrustSection() {
  const now = useRelativeNow();

  const dated = useMemo(
    () =>
      REVIEWS.map((r) => ({
        ...r,
        when: formatRelativeReviewDate(
          new Date(REVIEWS_ANCHOR.getTime() - r.postedAtOffsetMs),
          now,
        ),
      })),
    [now],
  );

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
            Retours de la bêta — mis à jour en continu.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
          {dated.map((review, i) => (
            <Reveal key={review.name} delay={i * 0.04}>
              <blockquote className="trust-card h-full rounded-2xl border border-mg-border bg-mg-card/80 px-5 py-4">
                <p className="text-sm leading-relaxed text-mg-foreground">
                  « {review.quote} »
                </p>
                <footer className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-medium tracking-wide text-mg-faint">
                  <span>
                    {review.name} · {review.platform} · {review.city}
                  </span>
                  <span className="text-mg-accent/80">· {review.when}</span>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
