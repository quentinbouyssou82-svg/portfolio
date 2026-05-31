"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/use-in-view";
import { useMotionEnabled } from "@/hooks/use-motion-prefs";
import { usePageVisible } from "@/hooks/use-page-visible";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  twinkle: number;
};

const PARTICLE_COUNT = 18;

export function PricingGoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const motionEnabled = useMotionEnabled();
  const pageVisible = usePageVisible();
  const inView = useInView(hostRef);
  const shouldAnimate = motionEnabled && pageVisible && inView;

  useEffect(() => {
    if (!shouldAnimate) return;

    const el = canvasRef.current;
    const parent = hostRef.current;
    if (!el || !parent) return;

    const context = el.getContext("2d");
    if (!context) return;

    let raf = 0;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const rect = parent!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      el!.width = Math.floor(w * dpr);
      el!.height = Math.floor(h * dpr);
      el!.style.width = `${w}px`;
      el!.style.height = `${h}px`;
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.16 - 0.04,
        r: Math.random() * 1.6 + 0.35,
        alpha: Math.random() * 0.55 + 0.15,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    function tick() {
      context!.clearRect(0, 0, w, h);
      const isLight =
        document.documentElement.getAttribute("data-theme") === "light";
      const fillCore = isLight ? "160, 130, 78" : "219, 200, 138";
      const alphaScale = isLight ? 0.55 : 1;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += 0.035;

        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        if (p.y > h + 4) p.y = -4;

        const pulse = 0.55 + Math.sin(p.twinkle) * 0.45;
        const alpha = p.alpha * pulse * alphaScale;

        context!.beginPath();
        context!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context!.fillStyle = `rgba(${fillCore}, ${alpha})`;
        context!.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    init();
    tick();

    const observer = new ResizeObserver(() => {
      resize();
      init();
    });
    observer.observe(parent);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [shouldAnimate]);

  if (!motionEnabled) return null;

  return (
    <div ref={hostRef} className="absolute inset-0" aria-hidden>
      <canvas
        ref={canvasRef}
        className="pricing-gold-particles pointer-events-none absolute inset-0 z-[1]"
      />
    </div>
  );
}
