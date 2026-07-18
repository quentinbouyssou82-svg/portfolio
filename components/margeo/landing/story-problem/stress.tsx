"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { PremiumCard } from "@/components/margeo/landing/story-problem/premium-card";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function ProblemStress() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [seconds, setSeconds] = useState(15);
  const [phase, setPhase] = useState<"countdown" | "punchline">("countdown");

  useEffect(() => {
    if (!inView || reduceMotion) {
      if (inView) {
        setSeconds(12);
        setPhase("punchline");
      }
      return;
    }

    setSeconds(15);
    setPhase("countdown");

    const interval = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 12) {
          window.clearInterval(interval);
          setPhase("punchline");
          return 12;
        }
        return s - 1;
      });
    }, 650);

    return () => window.clearInterval(interval);
  }, [inView, reduceMotion]);

  return (
    <PremiumCard index={0} className="mx-auto max-w-lg overflow-hidden rounded-[2rem] p-1" tilt={false}>
      <div ref={ref} className="relative">
      <div className="problem-stress-glow" aria-hidden />
      <div className="relative overflow-hidden rounded-[1.85rem] bg-gradient-to-b from-[#101015] to-[#09090b] px-5 py-8 sm:px-8 sm:py-10">

        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto w-full max-w-[280px] rounded-[1.6rem] border border-white/[0.1] bg-black/60 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        >
          <div className="rounded-[1.35rem] bg-[#0c0c10] px-4 pt-8 pb-5">
            <div className="mx-auto h-4 w-20 rounded-full bg-black" aria-hidden />

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : undefined}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-4 rounded-2xl border border-mg-go/30 bg-mg-go-soft/40 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5">
                  <PlatformLogo platform="Uber Eats" size="xs" showLabel />
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-mg-faint">
                  <Clock className="size-3" aria-hidden />
                  Maintenant
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-mg-go">7,00 €</p>
              <p className="text-[11px] text-mg-muted">3,2 km · 15 s</p>
            </motion.div>

            <div className="mt-6 flex flex-col items-center">
              <AnimatePresence mode="wait">
                {phase === "countdown" ? (
                  <motion.div
                    key={seconds}
                    initial={{ scale: 0.85, opacity: 0, filter: "blur(6px)" }}
                    animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                    exit={{ scale: 1.08, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.25 }}
                    className="flex size-20 items-center justify-center rounded-full border-2 border-mg-stop/50 bg-mg-stop-soft/30 text-4xl font-bold tabular-nums text-mg-stop shadow-[0_0_40px_rgba(248,113,113,0.25)]"
                    aria-live="polite"
                    aria-label={`${seconds} secondes restantes`}
                  >
                    {seconds}
                  </motion.div>
                ) : (
                  <motion.p
                    key="punchline"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="text-center text-lg font-semibold tracking-tight text-mg-foreground sm:text-xl"
                  >
                    Tu acceptes{" "}
                    <span className="text-mg-stop">à l&apos;aveugle.</span>
                  </motion.p>
                )}
              </AnimatePresence>
              {phase === "countdown" && (
                <p className="mt-3 text-xs text-mg-faint">pour décider</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </PremiumCard>
  );
}
