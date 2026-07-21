"use client";

import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Clock, Fuel, MapPin, Receipt, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "@/components/margeo/animated-counter";
import { PremiumCard, PremiumIconBadge } from "@/components/margeo/landing/story-problem/premium-card";
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
      <PremiumCard index={0} className="rounded-3xl p-6 sm:p-8">
        <div className="problem-comparison-glow" aria-hidden />
        <p className="text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase">
          Uber affiche
        </p>
        <p className="problem-amount-glow mt-6 text-center text-5xl font-bold tracking-tight text-mg-go sm:text-6xl">
          7 €
        </p>
        <p className="mt-2 text-center text-sm text-mg-muted">
          Gain affiché
        </p>
        <div className="mg-progress-track mt-6 h-2 overflow-hidden rounded-full">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-mg-go/80 to-mg-go"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.2 }}
          />
        </div>
      </PremiumCard>

      <PremiumCard index={1} className="rounded-3xl p-6 sm:p-8">
        <div className="problem-comparison-glow" aria-hidden />
        <p className="text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase">
          Ce qui reste
        </p>

        <ul className="mt-5 space-y-2.5">
          {DEDUCTIONS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.label}
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  delay: 0.15 + i * 0.08,
                }}
                className="problem-inner-row flex items-center justify-between rounded-xl px-3 py-2.5"
              >
                <span className="flex items-center gap-2.5 text-sm text-mg-muted">
                  <PremiumIconBadge icon={Icon} tone="danger" size="sm" />
                  {item.label}
                </span>
                <span className="text-xs font-medium text-mg-stop">−</span>
              </motion.li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-white/[0.08] pt-6 text-center">
          <motion.p
            className="problem-amount-glow-warn text-5xl font-bold tracking-tight text-mg-check sm:text-6xl"
            animate={
              reduceMotion
                ? undefined
                : inView
                  ? { scale: [1, 1.03, 1] }
                  : undefined
            }
            transition={{ duration: 0.55, delay: 2.2 }}
          >
            {amount.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </motion.p>
          <p className="mt-2 text-sm text-mg-muted">Peut-être.</p>
        </div>
      </PremiumCard>
    </div>
  );
}

export function ProblemStats() {
  const stats = [
    {
      label: "Acceptées",
      value: 18,
      suffix: "",
      tone: "text-mg-foreground",
    },
    {
      label: "Rentables",
      value: 9,
      suffix: "",
      tone: "text-mg-go",
    },
    {
      label: "Argent perdu",
      value: -22,
      suffix: " €",
      tone: "text-mg-stop",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
      {stats.map((stat, i) => (
        <PremiumCard
          key={stat.label}
          index={i}
          className="rounded-2xl px-4 py-6 text-center sm:px-5 sm:py-7"
        >
          <p className="text-[11px] font-medium tracking-wide text-mg-faint uppercase">
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-3 text-3xl font-bold tracking-tight sm:text-4xl",
              stat.tone,
            )}
          >
            {stat.label.includes("perdu") ? "−" : ""}
            <AnimatedCounter
              value={Math.abs(stat.value)}
              suffix={stat.suffix}
              duration={1.4}
            />
          </p>
        </PremiumCard>
      ))}
    </div>
  );
}
