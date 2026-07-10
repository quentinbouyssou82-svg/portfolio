"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MapPin, UtensilsCrossed } from "lucide-react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function ProblemRoute() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: EASE }}
      className="problem-glass-card overflow-hidden rounded-3xl"
    >
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="border-b border-white/[0.06] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase">
            Le trajet invisible
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-mg-foreground sm:text-xl">
            Uber ne compte que la moitié du trajet.
          </p>

          <div className="relative mt-6 pl-1">
            <div
              className="absolute top-3 bottom-3 left-[0.7rem] w-px bg-gradient-to-b from-mg-accent/50 via-mg-border to-mg-stop/50"
              aria-hidden
            />

            <div className="relative flex gap-3 pb-5">
              <span className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border border-mg-accent/30 bg-mg-accent-soft">
                <UtensilsCrossed className="size-3.5 text-mg-accent" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-medium tracking-wide text-mg-faint uppercase">
                  Restaurant
                </p>
                <p className="text-sm font-semibold text-mg-foreground">
                  Burger Père &amp; Fils
                </p>
              </div>
            </div>

            <div className="relative flex gap-3 pb-5">
              <span className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border border-mg-go/30 bg-mg-go-soft">
                <MapPin className="size-3.5 text-mg-go" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-medium tracking-wide text-mg-faint uppercase">
                  Client
                </p>
                <p className="text-sm font-semibold text-mg-foreground">
                  Quai Claude Bernard
                </p>
              </div>
            </div>

            <div className="relative flex gap-3">
              <span className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-mg-stop/40 bg-mg-stop-soft/60">
                <MapPin className="size-3.5 text-mg-stop/70" aria-hidden />
              </span>
              <div>
                <p className="text-[10px] font-medium tracking-wide text-mg-stop/80 uppercase">
                  Retour à vide
                </p>
                <p className="text-sm font-semibold text-mg-muted">
                  2,4 km · non payés · non affichés
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-[220px] bg-gradient-to-br from-mg-accent/[0.08] via-transparent to-mg-stop/[0.06] p-6 lg:p-8">
          <div className="problem-route-map relative h-full min-h-[180px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0e]/80">
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 320 200"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
            >
              <defs>
                <pattern id="problem-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="320" height="200" fill="url(#problem-grid)" />
              <motion.path
                d="M 60 140 C 90 110, 120 90, 160 100 S 230 70, 260 55"
                fill="none"
                stroke="rgba(129,140,248,0.55)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.4 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: EASE }}
              />
              <motion.path
                d="M 260 55 C 250 80, 220 120, 180 150"
                fill="none"
                stroke="rgba(248,113,113,0.45)"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0.3 }}
                whileInView={{ pathLength: 1, opacity: 0.85 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
              />
              <circle cx="60" cy="140" r="5" fill="#818cf8" />
              <circle cx="260" cy="55" r="5" fill="#34d399" />
              <circle cx="180" cy="150" r="4" fill="#f87171" opacity="0.8" />
            </svg>

            <div className="absolute top-3 left-3 rounded-lg border border-white/[0.08] bg-black/50 px-2 py-1 text-[10px] text-mg-muted backdrop-blur-sm">
              Trajet payé
            </div>
            <div className="absolute right-3 bottom-3 rounded-lg border border-mg-stop/25 bg-mg-stop-soft/80 px-2 py-1 text-[10px] font-medium text-mg-stop backdrop-blur-sm">
              Retour invisible
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
