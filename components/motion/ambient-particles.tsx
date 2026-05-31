"use client";

import { useEffect, useRef } from "react";
import { useMotionEnabled } from "@/hooks/use-motion-prefs";
import { usePageVisible } from "@/hooks/use-page-visible";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

const PARTICLE_COUNT = 24;

export function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionEnabled = useMotionEnabled();
  const pageVisible = usePageVisible();

  useEffect(() => {
    if (!motionEnabled || !pageVisible) return;

    const el = canvasRef.current;
    if (!el) return;

    const context = el.getContext("2d");
    if (!context) return;

    let raf = 0;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      w = window.innerWidth;
      h = window.innerHeight;
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
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.35 + 0.08,
      }));
    }

    function tick() {
      context!.clearRect(0, 0, w, h);
      const isDark = document.documentElement.getAttribute("data-theme") !== "light";
      const color = isDark ? "148, 168, 220" : "90, 110, 170";

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        context!.beginPath();
        context!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        context!.fillStyle = `rgba(${color}, ${p.alpha})`;
        context!.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    init();
    tick();

    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [motionEnabled, pageVisible]);

  if (!motionEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.55]"
    />
  );
}
