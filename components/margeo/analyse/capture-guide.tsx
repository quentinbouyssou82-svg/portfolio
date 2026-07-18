"use client";

import { Camera, CheckCircle2, Clock, MapPin, Route } from "lucide-react";
import { PlatformLogo } from "@/components/margeo/platform-logo";

const TIPS = [
  "Capture quand la course est proposée",
  "Gain, distance et temps visibles",
  "PNG, JPG ou WebP — pas besoin de recadrer",
];

function OfferScreenshotExample() {
  return (
    <div className="mx-auto w-full max-w-[220px] rounded-2xl border border-mg-border-strong bg-mg-card p-2 shadow-mg-card">
      <div className="rounded-xl border border-mg-border bg-mg-surface px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <PlatformLogo platform="Uber Eats" size="xs" showLabel />
          <span className="text-[10px] text-mg-faint">Nouvelle course</span>
        </div>

        <p className="mt-3 text-lg font-bold text-mg-foreground">7,80 €</p>
        <p className="text-[10px] text-mg-faint">Gain estimé</p>

        <div className="mt-3 space-y-1.5 rounded-lg border border-mg-border bg-mg-card p-2.5">
          <p className="flex items-center gap-1.5 text-[10px] text-mg-muted">
            <MapPin className="size-3 shrink-0 text-mg-accent" />
            McDonald&apos;s République
          </p>
          <p className="flex items-center gap-1.5 text-[10px] text-mg-muted">
            <MapPin className="size-3 shrink-0 text-mg-faint" />
            12 rue de la Paix
          </p>
          <div className="flex gap-3 pt-0.5 text-[10px] text-mg-faint">
            <span className="inline-flex items-center gap-1">
              <Route className="size-3" /> 4,1 km
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> 18 min
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex gap-2">
          <span className="flex-1 rounded-lg bg-[var(--mg-surface-muted)] py-1.5 text-center text-[10px] text-mg-faint">
            Refuser
          </span>
          <span className="flex-1 rounded-lg bg-[#06c167] py-1.5 text-center text-[10px] font-semibold text-[#04120c]">
            Accepter
          </span>
        </div>
      </div>
    </div>
  );
}

export function CaptureGuide() {
  return (
    <div className="app-glass-surface mt-5 grid gap-5 rounded-2xl p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-mg-foreground">
          <Camera className="size-4 text-mg-accent" />
          Quoi capturer ?
        </p>
        <ul className="mt-3 space-y-2">
          {TIPS.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-sm leading-relaxed text-mg-muted"
            >
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-mg-go" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
      <OfferScreenshotExample />
    </div>
  );
}
