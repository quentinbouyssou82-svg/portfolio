"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Eyebrow } from "../ui/eyebrow";
import { NeonButtonLink } from "../ui/neon-button";
import { LiveAppPreview } from "./live-app-preview";

const CN = "/demos/cerveau-numerique";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const previewReveal = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.25 },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-20 sm:pt-48 sm:pb-28">
      <div
        className="relative z-10 mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-10"
      >
        <motion.div
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Eyebrow>Assistant de vie personnel · 100% gratuit</Eyebrow>
          </motion.div>

          <motion.h1
            variants={item}
            className="cn-hero-title mt-8 text-balance text-[2.75rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-6xl lg:text-5xl xl:text-6xl 2xl:text-[4.5rem]"
          >
            Il{" "}
            <span className="cn-gradient-text cn-title-glow">
              range ta vie
            </span>
            <br />
            avant que tu y penses.
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-xl text-balance text-lg leading-relaxed text-[var(--cn-muted)] sm:text-xl lg:mx-0"
          >
            Documents classés, mails triés, tâches anticipées.
            <br className="hidden sm:block" /> Automatiquement.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-11 flex flex-col items-center gap-5 sm:flex-row"
          >
            <NeonButtonLink href={`${CN}/onboarding`} className="text-base">
              Démarrer — c&apos;est gratuit
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </NeonButtonLink>

            <a
              href="#fonctionnalites"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--cn-faint)] underline-offset-4 transition-colors duration-300 hover:text-[var(--cn-muted)] hover:underline"
            >
              Voir les fonctionnalités
              <ChevronDown className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center gap-3 border-t border-white/[0.06] pt-6 lg:items-start"
          >
            <p className="text-xs text-[var(--cn-ghost)]">
              Aucune carte bancaire requise · Prêt en 2 minutes
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[var(--cn-faint)] lg:justify-start">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <ShieldCheck className="size-3.5 text-[var(--cn-primary)]" />
                Données chiffrées
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="size-3.5 text-[var(--cn-secondary)]" />
                IA intégrée
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Clock3 className="size-3.5 text-[#6ee7ff]" />
                Récap à 7h
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-full"
          variants={previewReveal}
          initial="hidden"
          animate="show"
        >
          <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-none lg:[perspective:1600px]">
            <div className="cn-tilt-wrap">
              <LiveAppPreview />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
