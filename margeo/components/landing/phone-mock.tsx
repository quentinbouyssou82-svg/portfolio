"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Route } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";
import { VerdictBadge } from "@/components/verdict-badge";

/**
 * Maquette de l'app mobile affichant un résultat d'analyse.
 * Entièrement en HTML/CSS : sert de "capture d'écran produit" crédible.
 */
export function PhoneMock() {
  return (
    <div className="relative mx-auto w-[300px] rounded-[2.4rem] border border-border-strong bg-surface p-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <div className="rounded-[1.9rem] border border-border bg-background px-4 pt-5 pb-6">
        {/* Barre de statut */}
        <div className="mb-5 flex items-center justify-between px-1 text-[10px] text-faint">
          <span>19:04</span>
          <span className="h-4 w-16 rounded-full bg-white/[0.07]" />
          <span>5G · 84%</span>
        </div>

        {/* En-tête analyse */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-faint">
              Uber Eats · à l&apos;instant
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              Analyse terminée
            </p>
          </div>
          <VerdictBadge verdict="accept" />
        </div>

        {/* Score */}
        <div className="mt-5 flex justify-center">
          <ProgressRing value={84} size={132} strokeWidth={9}>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">84</p>
              <p className="text-[10px] font-medium tracking-wide text-faint uppercase">
                Score
              </p>
            </div>
          </ProgressRing>
        </div>

        {/* Métriques */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "Net", value: "6,10 €" },
            { label: "€/heure", value: "22,9 €" },
            { label: "Coût", value: "1,80 €" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-card px-2 py-2.5 text-center"
            >
              <p className="text-[10px] text-faint">{m.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Trajet */}
        <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
          <p className="flex items-center gap-2 text-[11px] text-muted">
            <MapPin className="size-3 text-accent" />
            Burger Père &amp; Fils → Quai Claude Bernard
          </p>
          <p className="flex items-center gap-3 text-[11px] text-faint">
            <span className="inline-flex items-center gap-1">
              <Route className="size-3" /> 3,2 km
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> 16 min
            </span>
          </p>
        </div>

        {/* Explication IA */}
        <div className="mt-3 rounded-xl border border-accent/20 bg-accent-soft p-3">
          <p className="text-[11px] leading-relaxed text-foreground/90">
            <span className="font-semibold text-accent">Margeo · </span>
            Cette course dépasse ton objectif de 6,90 € de l&apos;heure. Fonce.
          </p>
        </div>
      </div>

      {/* Cartes flottantes */}
      <motion.div
        className="absolute -left-24 top-24 hidden rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-card lg:block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[10px] text-faint">Gain du jour</p>
        <p className="text-sm font-bold text-accent">+68,40 €</p>
      </motion.div>
      <motion.div
        className="absolute -right-24 bottom-28 hidden rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-card lg:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <p className="text-[10px] text-faint">Courses évitées</p>
        <p className="text-sm font-bold text-foreground">
          9 <span className="text-[10px] font-normal text-stop">non rentables</span>
        </p>
      </motion.div>
    </div>
  );
}
