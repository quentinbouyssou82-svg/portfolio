"use client";

/** Fond continu violet/noir — une seule scène pour toute la landing. */
export function LandingBackdrop() {
  return (
    <div className="landing-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="landing-backdrop-base" />
      <div className="landing-backdrop-halo landing-backdrop-halo-a" />
      <div className="landing-backdrop-halo landing-backdrop-halo-b" />
      <div className="landing-backdrop-halo landing-backdrop-halo-c" />
      <div className="landing-backdrop-noise" />
    </div>
  );
}
