"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProblemComparison, ProblemStats } from "@/components/margeo/landing/story-problem/comparison";
import { ProblemRoute } from "@/components/margeo/landing/story-problem/route";
import { ProblemStress } from "@/components/margeo/landing/story-problem/stress";
import { ProblemTimeline } from "@/components/margeo/landing/story-problem/timeline";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

function ProblemAmbient() {
  return (
    <>
      <div className="problem-ambient-a" aria-hidden />
      <div className="problem-ambient-b" aria-hidden />
      <div className="problem-light-lines" aria-hidden />
      <div className="problem-grain absolute inset-0" aria-hidden />
    </>
  );
}

function ProblemOpener() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-4xl text-center">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-xs font-semibold tracking-[0.22em] text-mg-accent uppercase"
      >
        Le problème
      </motion.p>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.06, ease: EASE }}
        className="mt-4 text-sm font-medium tracking-wide text-mg-muted sm:text-base"
      >
        Chaque course acceptée est un pari.
      </motion.p>

      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, delay: 0.12, ease: EASE }}
        className="text-gradient mt-5 text-[2.1rem] leading-[1.08] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
      >
        Tu crois gagner{" "}
        <span className="text-gradient-accent">7 €.</span>
      </motion.h2>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-mg-muted text-pretty sm:text-xl"
      >
        …mais personne ne t&apos;a montré ce qu&apos;il reste vraiment.
      </motion.p>
    </div>
  );
}

function ProblemHook() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="problem-hook relative mx-auto max-w-3xl overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-10 sm:py-14"
    >
      <div className="problem-hook-glow" aria-hidden />
      <p className="relative text-xs font-semibold tracking-[0.2em] text-mg-faint uppercase">
        La question
      </p>
      <p className="relative mt-4 text-2xl font-bold tracking-tight text-mg-foreground sm:text-4xl">
        Comment éviter ça ?
      </p>
      <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-mg-muted sm:text-base">
        Tu viens de vivre une soirée type. La réponse arrive juste en dessous.
      </p>
    </motion.div>
  );
}

function SceneLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-center text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase sm:mb-8">
      {children}
    </p>
  );
}

export function StoryProblem() {
  return (
    <section
      id="probleme"
      className="problem-section relative scroll-mt-24 border-t border-mg-border py-20 sm:py-28"
    >
      <ProblemAmbient />

      <div className="relative mx-auto max-w-6xl px-5">
        <ProblemOpener />

        <div className="mt-16 space-y-20 sm:mt-24 sm:space-y-28">
          <div>
            <SceneLabel>La soirée d&apos;un livreur</SceneLabel>
            <ProblemTimeline />
          </div>

          <div>
            <SceneLabel>Ce qu&apos;on te montre vs la réalité</SceneLabel>
            <ProblemComparison />
          </div>

          <div>
            <SceneLabel>Le trajet que personne ne calcule</SceneLabel>
            <ProblemRoute />
          </div>

          <div>
            <SceneLabel>En une soirée</SceneLabel>
            <ProblemStats />
          </div>

          <div>
            <SceneLabel>Sous pression</SceneLabel>
            <ProblemStress />
          </div>

          <ProblemHook />
        </div>
      </div>
    </section>
  );
}
