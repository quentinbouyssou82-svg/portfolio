"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Route } from "lucide-react";
import { ProgressRing } from "@/components/margeo/progress-ring";
import { VerdictBadge } from "@/components/margeo/verdict-badge";
import { cn } from "@/lib/margeo/utils";

interface PhoneMockProps {
  variant?: "default" | "hero";
}

/**
 * Maquette produit crédible — HTML/CSS pur.
 */
export function PhoneMock({ variant = "default" }: PhoneMockProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "relative mx-auto rounded-[2.4rem] border border-mg-border-strong bg-mg-surface p-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]",
        isHero ? "w-full max-w-[320px] sm:max-w-[340px]" : "w-[300px]",
      )}
    >
      <div className="rounded-[1.9rem] border border-mg-border bg-mg-background px-4 pt-5 pb-6">
        <div className="mb-5 flex items-center justify-between px-1 text-[10px] text-mg-faint">
          <span>19:04</span>
          <span className="h-4 w-16 rounded-full bg-white/[0.07]" />
          <span>5G · 84%</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-mg-faint">
              Uber Eats · à l&apos;instant
            </p>
            <p className="mt-0.5 text-sm font-semibold text-mg-foreground">
              Verdict prêt
            </p>
          </div>
          <VerdictBadge verdict="accept" />
        </div>

        <div className="mt-5 flex justify-center">
          <ProgressRing value={84} size={isHero ? 140 : 132} strokeWidth={9}>
            <div className="text-center">
              <p className="text-3xl font-bold text-mg-foreground">84</p>
              <p className="text-[10px] font-medium tracking-wide text-mg-faint uppercase">
                / 100
              </p>
            </div>
          </ProgressRing>
        </div>

        <p className="mt-3 text-center text-sm font-semibold text-mg-go">
          Bonne course
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Net", value: "6,10 €" },
            { label: "€/heure", value: "22,9 €" },
            { label: "Coût", value: "1,80 €" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-mg-border bg-mg-card px-2 py-2.5 text-center"
            >
              <p className="text-[10px] text-mg-faint">{m.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-mg-foreground">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2 rounded-xl border border-mg-border bg-mg-card p-3">
          <p className="flex items-center gap-2 text-[11px] text-mg-muted">
            <MapPin className="size-3 text-mg-accent" />
            Burger Père &amp; Fils → Quai Claude Bernard
          </p>
          <p className="flex items-center gap-3 text-[11px] text-mg-faint">
            <span className="inline-flex items-center gap-1">
              <Route className="size-3" /> 3,2 km
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> 16 min
            </span>
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-mg-go/25 bg-mg-go-soft p-3">
          <p className="text-[11px] leading-relaxed text-mg-foreground/90">
            <span className="font-semibold text-mg-go">Accepter · </span>
            Dépasse ton objectif horaire. Course proche, retour facile.
          </p>
        </div>
      </div>

      <motion.div
        className="absolute -left-20 top-20 hidden rounded-xl border border-mg-border bg-mg-card/95 px-3.5 py-2.5 shadow-mg-card backdrop-blur-sm lg:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[10px] text-mg-faint">Gain du jour</p>
        <p className="text-sm font-bold text-mg-go">+68,40 €</p>
      </motion.div>
      <motion.div
        className="absolute -right-20 bottom-28 hidden rounded-xl border border-mg-border bg-mg-card/95 px-3.5 py-2.5 shadow-mg-card backdrop-blur-sm lg:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <p className="text-[10px] text-mg-faint">Courses évitées</p>
        <p className="text-sm font-bold text-mg-foreground">
          9{" "}
          <span className="text-[10px] font-normal text-mg-stop">
            non rentables
          </span>
        </p>
      </motion.div>
    </div>
  );
}
