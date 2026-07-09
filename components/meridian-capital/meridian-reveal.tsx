"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const variants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

type MeridianRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
};

export function MeridianReveal({
  children,
  className,
  delay = 0,
  duration = 0.95,
}: MeridianRevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{ duration, delay, ease: EASE }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
