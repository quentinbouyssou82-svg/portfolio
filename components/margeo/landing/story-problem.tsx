"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ProblemComparison, ProblemStats } from "@/components/margeo/landing/story-problem/comparison";
import { PremiumCard } from "@/components/margeo/landing/story-problem/premium-card";
import { ProblemRoute } from "@/components/margeo/landing/story-problem/route";
import { ProblemStress } from "@/components/margeo/landing/story-problem/stress";
import { ProblemTimeline } from "@/components/margeo/landing/story-problem/timeline";

const SPRING = { type: "spring" as const, stiffness: 220, damping: 30 };

function ProblemOpener() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="problem-opener relative mx-auto max-w-4xl text-center">
      <div className="problem-opener-glow" aria-hidden />

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0 }}
        className="text-xs font-semibold tracking-[0.24em] text-mg-accent uppercase"
      >
        Le problème
      </motion.p>

      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="problem-title text-gradient mt-5 text-[2.15rem] leading-[1.18] font-bold tracking-tight text-balance sm:mt-6 sm:text-5xl sm:leading-[1.12] lg:text-[3.35rem]"
      >
        Tu crois gagner{" "}
        <span className="text-gradient-accent problem-title-accent">7&nbsp;€.</span>
      </motion.h2>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0.14 }}
        className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-mg-muted text-pretty sm:mt-5 sm:text-lg"
      >
        Le gain net reste souvent caché.
      </motion.p>
    </div>
  );
}

function ProblemHook() {
  return (
    <PremiumCard index={0} className="rounded-3xl px-6 py-10 text-center sm:px-10 sm:py-12">
      <div className="problem-hook-glow" aria-hidden />
      <p className="relative text-xs font-semibold tracking-[0.2em] text-mg-faint uppercase">
        La question
      </p>
      <p className="relative mt-3 text-2xl font-bold tracking-tight text-mg-foreground sm:text-4xl">
        Et si tu savais avant ?
      </p>
    </PremiumCard>
  );
}

function SceneLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="problem-scene-label mb-6 flex items-center justify-center gap-4 sm:mb-8">
      <span className="problem-scene-line hidden h-px flex-1 sm:block" aria-hidden />
      <p className="shrink-0 text-center text-[11px] font-semibold tracking-[0.2em] text-mg-faint uppercase">
        {children}
      </p>
      <span className="problem-scene-line hidden h-px flex-1 sm:block" aria-hidden />
    </div>
  );
}

export function StoryProblem() {
  return (
    <section
      id="probleme"
      className="problem-section relative scroll-mt-24 py-16 sm:py-24 lg:py-28"
    >
      <div className="section-bridge mb-12 sm:mb-16" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5">
        <ProblemOpener />

        <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-0">
          <div className="sm:mb-16">
            <SceneLabel>Une soirée</SceneLabel>
            <ProblemTimeline />
          </div>

          <div className="sm:mb-20 sm:ml-auto sm:max-w-5xl">
            <SceneLabel>Affiché vs réel</SceneLabel>
            <ProblemComparison />
          </div>

          <div className="sm:mb-16 sm:mr-auto sm:max-w-5xl">
            <SceneLabel>Le trajet invisible</SceneLabel>
            <ProblemRoute />
          </div>

          <div className="sm:mb-16">
            <SceneLabel>En une soirée</SceneLabel>
            <ProblemStats />
          </div>

          <div className="sm:mb-16">
            <SceneLabel>Sous pression</SceneLabel>
            <ProblemStress />
          </div>

          <ProblemHook />
        </div>
      </div>
    </section>
  );
}
