"use client";

import type { CSSProperties } from "react";

/**
 * Fond continu violet/noir — une seule scène pour toute la landing.
 * Couches : base → mesh → grille → halos → streaks → particules → vignette → noise.
 */
export function LandingBackdrop() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    x: `${6 + ((i * 37) % 88)}%`,
    y: `${8 + ((i * 53) % 84)}%`,
    delay: `${(i * 0.7) % 9}s`,
    dur: `${11 + (i % 7) * 1.4}s`,
    size: `${1 + (i % 3)}px`,
  }));

  return (
    <div className="landing-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="landing-backdrop-base" />
      <div className="landing-backdrop-mesh" />
      <div className="landing-backdrop-grid" />
      <div className="landing-backdrop-halo landing-backdrop-halo-a" />
      <div className="landing-backdrop-halo landing-backdrop-halo-b" />
      <div className="landing-backdrop-halo landing-backdrop-halo-c" />
      <div className="landing-backdrop-halo landing-backdrop-halo-d" />
      <div className="landing-backdrop-streak landing-backdrop-streak-a" />
      <div className="landing-backdrop-streak landing-backdrop-streak-b" />
      <div className="landing-backdrop-particles">
        {particles.map((p, i) => (
          <span
            key={i}
            className="landing-backdrop-particle"
            style={
              {
                "--p-x": p.x,
                "--p-y": p.y,
                "--p-delay": p.delay,
                "--p-dur": p.dur,
                "--p-size": p.size,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="landing-backdrop-vignette" />
      <div className="landing-backdrop-noise" />
    </div>
  );
}
