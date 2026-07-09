"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Field = {
  top: string;
  left: string;
  width: number;
  height: number;
  color: string;
  duration: number;
  depth: number;
  delay?: number;
};

// Slow-drifting color fields. Kept few and dim on purpose: the composition
// is carried by the top horizon glow, these only add depth below the fold.
const fields: Field[] = [
  {
    top: "22%",
    left: "-12%",
    width: 780,
    height: 520,
    color: "rgba(59, 130, 246, 0.13)",
    duration: 26,
    depth: 18,
  },
  {
    top: "30%",
    left: "58%",
    width: 720,
    height: 500,
    color: "rgba(139, 122, 246, 0.11)",
    duration: 30,
    depth: 26,
    delay: 2.4,
  },
  {
    top: "62%",
    left: "24%",
    width: 820,
    height: 540,
    color: "rgba(56, 189, 248, 0.09)",
    duration: 28,
    depth: 22,
    delay: 1.2,
  },
];

export function WaveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 20, mass: 0.7 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20, mass: 0.7 });

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  const horizonX = useTransform(springX, (v) => v * 24);

  return (
    <div
      aria-hidden
      // First child of <main>, default paint order — no negative z-index
      // (those escape into ancestor stacking contexts and can vanish
      // behind opaque parents in a nested layout).
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[var(--cn-hero-bg)]"
    >
      {/* Horizon glow — the visual anchor of the page. A wide, soft arc of
          light cresting at the top, like a sunrise over the fold. */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[85vh]"
        style={{ x: horizonX }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 62% at 50% -18%, rgba(96, 165, 250, 0.32), rgba(99, 102, 241, 0.12) 55%, transparent 78%)",
          }}
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Crisp hairline at the very top edge of the arc, Raycast-style. */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-70"
          style={{
            background:
              "linear-gradient(90deg, transparent 12%, rgba(147, 197, 253, 0.5) 50%, transparent 88%)",
          }}
        />
      </motion.div>

      {/* Faint technical dot grid, only near the top, fading out fast. */}
      <div className="cn-grid-bg" />

      {/* Deep ambient color fields with mouse parallax. */}
      {fields.map((field, i) => (
        <FieldEl key={i} field={field} springX={springX} springY={springY} />
      ))}

      {/* Film grain so gradients read as texture, not flat digital ramps. */}
      <div className="cn-noise-overlay absolute inset-0" />

      {/* Edge vignette to keep focus centered and text contrast high. */}
      <div className="absolute inset-0 bg-[radial-gradient(140%_110%_at_50%_12%,transparent_50%,var(--cn-hero-bg)_98%)]" />
    </div>
  );
}

function FieldEl({
  field,
  springX,
  springY,
}: {
  field: Field;
  springX: MotionValue<number>;
  springY: MotionValue<number>;
}) {
  const x = useTransform(springX, (v) => v * field.depth);
  const y = useTransform(springY, (v) => v * field.depth * 0.6);

  return (
    <motion.div
      className="absolute"
      style={{ top: field.top, left: field.left, x, y }}
    >
      <motion.div
        className="rounded-[50%]"
        style={{
          width: field.width,
          height: field.height,
          background: `radial-gradient(50% 50% at 50% 50%, ${field.color}, transparent 70%)`,
        }}
        animate={{ x: [-24, 24, -24], y: [0, 18, 0], scale: [1, 1.08, 1] }}
        transition={{
          duration: field.duration,
          delay: field.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}
