"use client";

import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed } from "lucide-react";
import {
  PremiumCard,
  PremiumIconBadge,
} from "@/components/margeo/landing/story-problem/premium-card";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const ROUTE_STOPS = [
  {
    icon: UtensilsCrossed,
    tone: "accent" as const,
    label: "Restaurant",
    value: "Burger Père & Fils",
    labelClass: "text-mg-faint",
    valueClass: "text-mg-foreground",
  },
  {
    icon: MapPin,
    tone: "go" as const,
    label: "Client",
    value: "Quai Claude Bernard",
    labelClass: "text-mg-faint",
    valueClass: "text-mg-foreground",
  },
  {
    icon: MapPin,
    tone: "danger" as const,
    label: "Retour à vide",
    value: "2,4 km · invisible",
    labelClass: "text-mg-stop/80",
    valueClass: "text-mg-muted",
  },
];

export function ProblemRoute() {
  return (
    <PremiumCard index={0} className="overflow-hidden rounded-3xl" tilt={false}>
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="border-b border-white/[0.06] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <p className="text-lg font-semibold tracking-tight text-mg-foreground sm:text-xl">
            La moitié du trajet, ignorée.
          </p>

          {/*
            Une seule ligne continue (comme Desktop) — évite les segments 1px
            coupés / invisibles sur Safari iOS.
          */}
          <div className="problem-route-track relative mt-6">
            <div
              className="problem-route-line absolute top-4 bottom-4 left-5 w-[2px] -translate-x-1/2"
              aria-hidden
            />

            <ol className="space-y-0">
              {ROUTE_STOPS.map((stop, i) => (
                <li
                  key={stop.label}
                  className={`relative flex gap-3.5 ${i < ROUTE_STOPS.length - 1 ? "pb-5" : ""}`}
                >
                  <div className="relative z-[2] flex w-10 shrink-0 justify-center">
                    <PremiumIconBadge
                      icon={stop.icon}
                      tone={stop.tone}
                      size="sm"
                      idle={false}
                    />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-[10px] font-medium tracking-wide uppercase ${stop.labelClass}`}
                    >
                      {stop.label}
                    </p>
                    <p className={`text-sm font-semibold ${stop.valueClass}`}>
                      {stop.value}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
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

            <div className="problem-route-chip absolute top-3 left-3 rounded-lg px-2 py-1 text-[10px] text-mg-muted backdrop-blur-sm">
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
