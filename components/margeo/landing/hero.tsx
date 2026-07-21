"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Ban,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { PhoneMock } from "@/components/margeo/landing/phone-mock";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";

const BENEFITS = [
  { icon: TrendingUp, label: "Mieux filtrer pour le €/h", tone: "go" as const },
  { icon: Ban, label: "Moins de mauvaises courses", tone: "stop" as const },
  { icon: Zap, label: "Verdict en ~2 secondes", tone: "accent" as const },
];

const ease = [0.21, 0.47, 0.32, 0.98] as const;

const TONE_CLASS = {
  go: "border-mg-go/25 bg-mg-go-soft/50 text-mg-foreground shadow-[0_0_20px_rgba(52,211,153,0.08)]",
  stop: "border-mg-stop/20 bg-mg-stop-soft/40 text-mg-foreground shadow-[0_0_20px_rgba(248,113,113,0.06)]",
  accent:
    "border-mg-accent/30 bg-mg-accent-soft/60 text-mg-foreground shadow-[0_0_24px_rgba(129,140,248,0.12)]",
};

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="hero-section relative overflow-visible pt-[calc(6.5rem+env(safe-area-inset-top,0px))] pb-14 sm:pt-[calc(9rem+env(safe-area-inset-top,0px))] sm:pb-28 lg:pb-32">
      <div className="hero-section-bloom" aria-hidden />
      <div className="hero-section-ring hero-section-ring-a" aria-hidden />
      <div className="hero-section-ring hero-section-ring-b" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="text-center lg:text-left">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-mg-accent/35 bg-mg-accent-soft/90 px-3.5 py-1.5 text-xs font-medium text-mg-accent backdrop-blur-md">
                <Sparkles className="size-3.5 animate-pulse" />
                Copilote IA · Beta ouverte
                <span className="hero-badge-pulse" aria-hidden />
              </span>
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease }}
              className="text-gradient mt-7 text-[2.35rem] leading-[1.15] font-bold tracking-tight text-balance sm:text-5xl sm:leading-[1.12] lg:text-[3.4rem]"
            >
              Accepte les bonnes courses.{" "}
              <span className="text-gradient-accent">Refuse</span> le reste.
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16, ease }}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mg-muted text-pretty sm:text-lg lg:mx-0"
            >
              Capture ta proposition. Uberly estime ton gain net (frais inclus)
              et t&apos;aide à décider — avant la fin du compte à rebours.
            </motion.p>

            <motion.ul
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
            >
              {BENEFITS.map(({ icon: Icon, label, tone }, i) => (
                <motion.li
                  key={label}
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`hero-benefit inline-flex items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium backdrop-blur-md sm:text-sm ${TONE_CLASS[tone]}`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <Icon
                    className={`size-3.5 ${
                      tone === "go"
                        ? "text-mg-go"
                        : tone === "stop"
                          ? "text-mg-stop"
                          : "text-mg-accent"
                    }`}
                  />
                  {label}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link href={margeoRoutes.signup} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="landing-cta-primary w-full min-h-12 px-7"
                >
                  Commencer gratuitement
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="#solution" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="landing-cta-secondary w-full min-h-12 px-7"
                >
                  Voir comment ça marche
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="mt-5 text-xs text-mg-faint"
            >
              Gratuit · 2 analyses/jour · Sans carte bancaire
            </motion.p>
          </div>

          <motion.div
            className="hero-phone-stage relative mx-auto w-full max-w-[380px] overflow-visible lg:max-w-none"
            initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
          >
            <div className="landing-phone-glow absolute inset-0 -z-10 scale-[1.15] blur-3xl" aria-hidden />
            <div className="hero-phone-orbit hero-phone-orbit-a" aria-hidden />
            <div className="hero-phone-orbit hero-phone-orbit-b" aria-hidden />
            <div className="hero-phone-spark hero-phone-spark-a" aria-hidden />
            <div className="hero-phone-spark hero-phone-spark-b" aria-hidden />
            <div className="hero-phone-spark hero-phone-spark-c" aria-hidden />
            <PhoneMock variant="hero" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
