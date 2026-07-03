"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "../ui/button";
import { Eyebrow } from "../ui/eyebrow";

const CN = "/demos/cerveau-numerique";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-8 sm:pt-36">
      <div className="cn-grid-bg" aria-hidden />
      <div className="cn-hero-glow" aria-hidden />

      <motion.div
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Eyebrow>Assistant de vie personnel · 100% gratuit</Eyebrow>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-6 text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-6xl md:text-7xl"
        >
          Un cerveau numérique
          <br />
          <span className="cn-gradient-text">pour toute ta vie.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-[var(--cn-muted)]"
        >
          Il classe tes documents, trie tes mails et anticipe tes tâches —
          pendant que tu vis ta vie.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <ButtonLink href={`${CN}/onboarding`} size="lg" className="group">
            Démarrer — c&apos;est gratuit
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </ButtonLink>
          <a
            href="#produit"
            className="text-sm font-medium text-[var(--cn-faint)] underline-offset-4 transition-colors hover:text-[var(--cn-muted)] hover:underline"
          >
            Voir comment ça marche
          </a>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-5 text-xs text-[var(--cn-ghost)]"
        >
          Aucune carte bancaire requise · Prêt en 2 minutes
        </motion.p>
      </motion.div>
    </section>
  );
}
