"use client";

import { motion } from "framer-motion";
import {
  Layers,
  Wand2,
  Sunrise,
  FolderCheck,
  MailCheck,
  CalendarClock,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "../ui/reveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  tint: string;
  glow: string;
};

const features: Feature[] = [
  {
    icon: Layers,
    title: "Tout centralisé",
    description: "Mails, documents, tâches et agenda réunis au même endroit.",
    tint: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.35)",
  },
  {
    icon: Wand2,
    title: "Zéro effort",
    description: "L'IA classe, priorise et agit avant même que tu y penses.",
    tint: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.35)",
  },
  {
    icon: Sunrise,
    title: "Toujours prêt",
    description: "Un récap chaque matin à 7h. Aucune surprise dans la journée.",
    tint: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.35)",
  },
];

const proofPoints = [
  { icon: FolderCheck, label: "Documents classés en continu" },
  { icon: MailCheck, label: "Mails triés par priorité" },
  { icon: CalendarClock, label: "Échéances anticipées" },
];

export function Features() {
  return (
    <section
      id="fonctionnalites"
      className="relative scroll-mt-28 px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section header — gives the cards context instead of floating alone. */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="cn-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--cn-primary)]">
            Fonctionnalités
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Une seule app. Trois promesses tenues.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--cn-muted)]">
            Pas de tableau de bord à configurer, pas de règles à écrire. Tu
            connectes tes comptes, le système fait le reste.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 0.1} y={28}>
                <motion.article
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative h-full overflow-hidden rounded-[var(--cn-radius-lg)] border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-7 transition-colors duration-300 hover:border-white/[0.15]"
                >
                  {/* Hover glow anchored to the icon corner. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(240px 170px at 18% -8%, ${feature.glow}, transparent 70%)`,
                    }}
                  />

                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 17,
                      delay: i * 0.1 + 0.15,
                    }}
                    className="relative flex size-11 items-center justify-center rounded-xl border"
                    style={{
                      background: `linear-gradient(135deg, ${feature.tint}26, ${feature.tint}08)`,
                      borderColor: `${feature.tint}2e`,
                      boxShadow: `0 8px 22px -10px ${feature.glow}`,
                    }}
                  >
                    <Icon
                      className="size-5"
                      style={{ color: feature.tint }}
                      strokeWidth={1.8}
                    />
                  </motion.span>

                  <h3 className="relative mt-6 text-base font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-[var(--cn-muted)]">
                    {feature.description}
                  </p>
                </motion.article>
              </Reveal>
            );
          })}
        </div>

        {/* Proof strip — quiet, factual, fills the gap between cards and CTA. */}
        <Reveal delay={0.15}>
          <div className="mt-14 flex flex-col items-center justify-center gap-x-10 gap-y-3 border-t border-white/[0.06] pt-8 sm:flex-row">
            {proofPoints.map((point) => {
              const Icon = point.icon;
              return (
                <span
                  key={point.label}
                  className="inline-flex items-center gap-2 text-sm text-[var(--cn-faint)]"
                >
                  <Icon className="size-4 text-[var(--cn-muted)]" strokeWidth={1.8} />
                  {point.label}
                </span>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
