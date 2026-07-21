"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

function formatValue(
  n: number,
  decimals: number,
  prefix: string,
  suffix: string,
): string {
  return `${prefix}${n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

/** Alias — même implémentation que components/margeo/animated-counter. */
export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.2,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const finalText = formatValue(value, decimals, prefix, suffix);

    if (reducedMotion || !inView) {
      node.textContent = finalText;
      return;
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate(latest) {
        node.textContent = formatValue(latest, decimals, prefix, suffix);
      },
      onComplete() {
        node.textContent = finalText;
      },
    });

    return () => {
      controls.stop();
      node.textContent = finalText;
    };
  }, [inView, value, decimals, prefix, suffix, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {formatValue(value, decimals, prefix, suffix)}
    </span>
  );
}
