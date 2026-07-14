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
        initial={reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(6px)" }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0 }}
        className="text-xs font-semibold tracking-[0.24em] text-mg-accent uppercase"
      >
        Le problème
      </motion.p>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0.06 }}
        className="mt-5 text-sm font-medium tracking-wide text-mg-muted sm:text-base"
      >
        Chaque course, un pari à l'aveugle.
      </motion.p>

      <motion.h2
        initial={reduceMotion ? false : { opacity: 0, y: 18, filter: "blur(8px)" }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0.1 }}
        className="problem-title text-gradient mt-6 text-[2.15rem] leading-[1.06] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.35rem]"
      >
        Tu crois gagner{" "}
        <span className="text-gradient-accent problem-title-accent">7 €.</span>
      </motion.h2>

      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0.16 }}
        className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mg-muted text-pretty sm:mt-7 sm:text-xl"
      >
        …mais personne ne te montre ce qu&apos;il reste vraiment.
      </motion.p>
    </div>
  );
}

function ProblemHook() {
  return (
    <PremiumCard index={0} className="rounded-3xl px-6 py-12 text-center sm:px-10 sm:py-14">
      <div className="problem-hook-glow" aria-hidden />
      <p className="relative text-xs font-semibold tracking-[0.2em] text-mg-faint uppercase">
        La question
      </p>
      <p className="relative mt-4 text-2xl font-bold tracking-tight text-mg-foreground sm:text-4xl">
        Et si tu savais avant d&apos;accepter ?
      </p>
      <p className="relative mx-auto mt-4 max-w-md text-sm leading-relaxed text-mg-muted sm:text-base">
        La réponse est juste en dessous.
      </p>
    </PremiumCard>
  );
}

function SceneLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="problem-scene-label mb-8 flex items-center justify-center gap-4 sm:mb-10">
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
      className="problem-section relative scroll-mt-24 py-20 sm:py-28"
    >
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
