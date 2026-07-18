"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, ScanLine, ShieldCheck, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/margeo/reveal";
import { SectionShell } from "@/components/margeo/landing/section-shell";
import { cn } from "@/lib/margeo/utils";

const STATS = [
  {
    icon: ScanLine,
    value: 2400,
    suffix: "+",
    label: "Courses analysées",
    detail: "beta",
    bars: [40, 55, 48, 70, 62, 85, 78],
    featured: true,
  },
  {
    icon: Clock,
    value: 8,
    suffix: " s",
    label: "Capture → verdict",
    detail: "en moyenne",
    bars: [30, 45, 60, 80, 95, 88, 100],
    featured: false,
  },
  {
    icon: TrendingUp,
    value: 4.2,
    suffix: " €",
    prefix: "+",
    decimals: 1,
    label: "Gain net détecté",
    detail: "par analyse",
    bars: [35, 50, 42, 68, 75, 90, 82],
    featured: false,
  },
  {
    icon: ShieldCheck,
    value: 92,
    suffix: "%",
    label: "Satisfaits",
    detail: "après 1 semaine",
    bars: [50, 58, 65, 72, 80, 88, 92],
    featured: false,
  },
];

function AnimatedStat({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduceMotion]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals).replace(".", ",")
      : Math.round(display).toLocaleString("fr-FR");

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

export function SocialProof() {
  return (
    <SectionShell
      id="resultats"
      eyebrow="Résultats beta"
      title="Des livreurs qui décident mieux"
      description="Chiffres beta Uberly — mis à jour chaque semaine."
      className="relative py-16 sm:py-24"
    >
      <div className="section-bridge mb-14 sm:mb-16" aria-hidden />

      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <motion.article
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22 }}
              className={cn(
                "proof-card landing-card-hover p-5 sm:p-6",
                stat.featured && "proof-card-featured sm:col-span-2 lg:col-span-1",
                i === 0 && "lg:row-span-1",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl border border-mg-accent/25 bg-mg-accent-soft shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                  <stat.icon className="size-4 text-mg-accent" />
                </span>
                {stat.featured && (
                  <span className="rounded-full border border-mg-accent/30 bg-mg-accent-soft px-2 py-0.5 text-[9px] font-bold tracking-wide text-mg-accent uppercase">
                    Live
                  </span>
                )}
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-mg-foreground sm:text-4xl">
                <AnimatedStat
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="mt-1.5 text-sm font-medium text-mg-foreground">
                {stat.label}
              </p>
              <p className="mt-0.5 text-xs text-mg-faint">{stat.detail}</p>
              <div className="proof-mini-bars" aria-hidden>
                {stat.bars.map((h, bi) => (
                  <span
                    key={bi}
                    style={{
                      height: `${h}%`,
                      animationDelay: `${0.05 * bi + i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-10 text-center">
        <p className="text-xs text-mg-faint">
          * Chiffres beta. Résultats variables selon véhicule et zone.
        </p>
      </Reveal>
    </SectionShell>
  );
}
