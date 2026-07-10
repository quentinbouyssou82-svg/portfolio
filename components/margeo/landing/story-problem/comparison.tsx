"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Clock, Fuel, MapPin, Receipt, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "@/components/margeo/animated-counter";
import { cn } from "@/lib/margeo/utils";

const DEDUCTIONS = [
  { label: "Essence", icon: Fuel },
  { label: "Temps perdu", icon: Clock },
  { label: "Retour à vide", icon: MapPin },
  { label: "Usure", icon: Wrench },
  { label: "Impôts & charges", icon: Receipt },
] as const;

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function ProblemComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [amount, setAmount] = useState(7);

  useEffect(() => {
    if (!inView || reduceMotion) {
      if (inView) setAmount(3.5);
      return;
    }

    const controls = animate(7, 3.5, {
      duration: 2.4,
      delay: 1.2,
      ease: EASE,
      onUpdate: (v) => setAmount(Math.round(v * 100) / 100),
    });

    return () => controls.stop();
  }, [inView, reduceMotion]);

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="problem-glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8"
      >
        <div className="problem-comparison-glow problem-comparison-glow-green" aria-hidden />
        <p className="text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase">
          Ce que voit Uber
        </p>
        <p className="mt-6 text-center text-5xl font-bold tracking-tight text-mg-go sm:text-6xl">
          7 €
        </p>
        <p className="mt-2 text-center text-sm text-mg-muted">
          Gain affiché · simple · rassurant
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-mg-go"
            initial={{ width: "100%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
        className="problem-glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8"
      >
        <div className="problem-comparison-glow problem-comparison-glow-red" aria-hidden />
        <p className="text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase">
          Ce qui reste réellement
        </p>

        <ul className="mt-5 space-y-2.5">
          {DEDUCTIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.45, ease: EASE }}
                className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5"
              >
                <span className="flex items-center gap-2 text-sm text-mg-muted">
                  <Icon className="size-3.5 text-mg-stop/80" aria-hidden />
                  {item.label}
                </span>
                <span className="text-xs font-medium text-mg-stop">−</span>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-white/[0.08] pt-6 text-center">
          <motion.p
            className="text-5xl font-bold tracking-tight text-mg-check sm:text-6xl"
            animate={
              reduceMotion
                ? undefined
                : inView
                  ? { scale: [1, 1.04, 1] }
                  : undefined
            }
            transition={{ duration: 0.5, delay: 2.2 }}
          >
            {amount.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </motion.p>
          <p className="mt-2 text-sm text-mg-muted">Dans ta poche. Peut-être.</p>
        </div>
      </motion.div>
    </div>
  );
}

export function ProblemStats() {
  const reduceMotion = useReducedMotion();

  const stats = [
    {
      label: "Courses acceptées aujourd'hui",
      value: 18,
      suffix: "",
      tone: "text-mg-foreground",
    },
    {
      label: "Courses réellement rentables",
      value: 9,
      suffix: "",
      tone: "text-mg-go",
    },
    {
      label: "Argent perdu",
      value: -22,
      suffix: " €",
      tone: "text-mg-stop",
      prefix: "",
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.1, duration: 0.55, ease: EASE }}
          className="problem-glass-card rounded-2xl px-4 py-5 text-center sm:px-5 sm:py-6"
        >
          <p className="text-[11px] font-medium tracking-wide text-mg-faint uppercase">
            {stat.label}
          </p>
          <p className={cn("mt-2 text-3xl font-bold tracking-tight sm:text-4xl", stat.tone)}>
            {stat.label.includes("perdu") ? "−" : ""}
            <AnimatedCounter
              value={Math.abs(stat.value)}
              suffix={stat.suffix}
              duration={1.4}
            />
          </p>
        </motion.div>
      ))}
    </div>
  );
}
