"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const variants: Variants = {
  hidden: { opacity: 0, y: 36, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

type ApexRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function ApexReveal({ children, className, delay = 0 }: ApexRevealProps) {
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -48px 0px" }}
      transition={{ duration: 0.95, delay, ease: EASE }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
