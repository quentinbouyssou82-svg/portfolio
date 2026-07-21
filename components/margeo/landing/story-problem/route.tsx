"use client";

import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed } from "lucide-react";
import {
  PremiumCard,
  PremiumIconBadge,
} from "@/components/margeo/landing/story-problem/premium-card";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function ProblemRoute() {
  return (
    <PremiumCard index={0} className="overflow-hidden rounded-3xl" tilt={false}>
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="border-b border-white/[0.06] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <p className="text-lg font-semibold tracking-tight text-mg-foreground sm:text-xl">
            La moitié du trajet, ignorée.
          </p>

          <div className="relative mt-6">
            <div className="space-y-0">
              <div className="relative flex gap-3.5 pb-5">
                <div className="problem-route-rail relative flex w-10 shrink-0 justify-center">
                  <span className="problem-route-segment" aria-hidden />
                  <PremiumIconBadge
                    icon={UtensilsCrossed}
                    tone="accent"
                    size="sm"
                    idle={false}
                  />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-medium tracking-wide text-mg-faint uppercase">
                    Restaurant
                  </p>
                  <p className="text-sm font-semibold text-mg-foreground">
                    Burger Père &amp; Fils
                  </p>
                </div>
              </div>

              <div className="relative flex gap-3.5 pb-5">
                <div className="problem-route-rail relative flex w-10 shrink-0 justify-center">
                  <span className="problem-route-segment" aria-hidden />
                  <PremiumIconBadge
                    icon={MapPin}
                    tone="go"
                    size="sm"
                    idle={false}
                  />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-medium tracking-wide text-mg-faint uppercase">
                    Client
                  </p>
                  <p className="text-sm font-semibold text-mg-foreground">
                    Quai Claude Bernard
                  </p>
                </div>
              </div>

              <div className="relative flex gap-3.5">
                <div className="problem-route-rail relative flex w-10 shrink-0 justify-center">
                  <PremiumIconBadge
                    icon={MapPin}
                    tone="danger"
                    size="sm"
                    idle={false}
                  />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-medium tracking-wide text-mg-stop/80 uppercase">
                    Retour à vide
                  </p>
                  <p className="text-sm font-semibold text-mg-muted">
                    2,4 km · invisible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center bg-gradient-to-br from-mg-accent/[0.04] via-transparent to-transparent p-6 lg:p-8">
          <div className="problem-route-map relative aspect-[320/200] w-full overflow-hidden rounded-2xl">
            <svg
              className="block h-full w-full"
              viewBox="0 0 320 200"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <defs>
                <radialGradient id="problem-map-bg" cx="50%" cy="40%" r="70%">
                  <stop offset="0%" stopColor="rgba(129,140,248,0.08)" />
                  <stop offset="100%" stopColor="rgba(9,9,11,0.95)" />
                </radialGradient>
              </defs>
              <rect width="320" height="200" fill="url(#problem-map-bg)" />
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
    </PremiumCard>
  );
}
