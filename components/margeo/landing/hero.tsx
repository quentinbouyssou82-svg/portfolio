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
  { icon: TrendingUp, label: "Gagne plus d'argent" },
  { icon: Ban, label: "Évite les mauvaises courses" },
  { icon: Zap, label: "L'IA décide à ta place" },
];

const ease = [0.21, 0.47, 0.32, 0.98] as const;

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-mg-accent/30 bg-mg-accent-soft/80 px-3.5 py-1.5 text-xs font-medium text-mg-accent backdrop-blur-sm">
                <Sparkles className="size-3.5" />
                Copilote IA · Beta ouverte
              </span>
            </motion.div>

            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08, ease }}
              className="text-gradient mt-6 text-[2.35rem] leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]"
            >
              Gagne plus.{" "}
              <span className="text-gradient-accent">Refuse</span> les courses
              qui te font perdre.
            </motion.h1>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16, ease }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mg-muted text-pretty sm:text-lg lg:mx-0"
            >
              Uberly lit ta capture, calcule ton gain net réel et te dit en 2
              secondes : accepter, vérifier ou refuser — avant la fin du compte
              à rebours.
            </motion.p>

            <motion.ul
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease }}
              className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
            >
              {BENEFITS.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-mg-border bg-mg-card/60 px-3.5 py-2 text-xs font-medium text-mg-foreground backdrop-blur-sm sm:text-sm"
                >
                  <Icon className="size-3.5 text-mg-accent" />
                  {label}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link href={margeoRoutes.signup} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="landing-cta-primary w-full min-h-12 px-7"
                >
                  Rejoindre la beta
                  <ArrowRight />
                </Button>
              </Link>
              <Link href="#demo" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full min-h-12 px-7"
                >
                  Voir la démo
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="mt-4 text-xs text-mg-faint"
            >
              Gratuit · Sans carte bancaire · 5 analyses/jour
            </motion.p>
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-[360px] overflow-visible lg:max-w-none"
            initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease }}
          >
            <div className="landing-phone-glow absolute inset-0 -z-10 scale-110 blur-3xl" aria-hidden />
            <PhoneMock variant="hero" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
