"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  y?: number;
}

/** Wrapper scroll reveal — respecte prefers-reduced-motion. */
export function Reveal({ delay = 0, y = 24, ...props }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduceMotion ? 0 : 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      {...props}
    />
  );
}
