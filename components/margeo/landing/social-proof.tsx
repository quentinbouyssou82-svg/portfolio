"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, ScanLine, ShieldCheck, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/margeo/reveal";
import { SectionShell } from "@/components/margeo/landing/section-shell";

const STATS = [
  {
    icon: ScanLine,
    value: 2400,
    suffix: "+",
    label: "Courses analysées",
    detail: "en beta",
  },
  {
    icon: Clock,
    value: 8,
    suffix: " sec",
    label: "Temps moyen",
    detail: "capture → verdict",
  },
  {
    icon: TrendingUp,
    value: 4.2,
    suffix: " €",
    prefix: "+",
    decimals: 1,
    label: "Gain net moyen",
    detail: "détecté par analyse",
  },
  {
    icon: ShieldCheck,
    value: 92,
    suffix: "%",
    label: "Recommandent",
    detail: "après 1 semaine d'usage",
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
      title="Des livreurs qui gagnent plus intelligemment"
      description="Données agrégées de la beta Uberly — mises à jour chaque semaine."
      className="relative"
    >
      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08}>
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="landing-card-hover rounded-2xl border border-mg-border bg-mg-card/90 p-6 backdrop-blur-sm"
            >
              <stat.icon className="size-5 text-mg-accent" />
              <p className="mt-4 text-3xl font-bold tracking-tight text-mg-foreground sm:text-4xl">
                <AnimatedStat
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="mt-1 text-sm font-medium text-mg-foreground">
                {stat.label}
              </p>
              <p className="mt-0.5 text-xs text-mg-faint">{stat.detail}</p>
            </motion.article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} className="mt-8 text-center">
        <p className="text-xs text-mg-faint">
          * Chiffres beta basés sur les analyses agrégées des premiers testeurs.
          Résultats individuels variables selon véhicule et zone.
        </p>
      </Reveal>
    </SectionShell>
  );
}
