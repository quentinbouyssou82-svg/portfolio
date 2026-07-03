"use client";

import { motion } from "framer-motion";
import { BrandIcon } from "../ui/brand-icon";

export function AuthCard({
  subtitle,
  children,
}: {
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="cn-card w-full max-w-[420px] p-8"
    >
      <div className="flex flex-col items-center text-center">
        <BrandIcon />
        <h1 className="mt-4 text-xl font-semibold">Mon Cerveau Numérique</h1>
        <p className="mt-1 text-sm text-[var(--cn-muted)]">{subtitle}</p>
      </div>
      <div className="mt-6">{children}</div>
    </motion.div>
  );
}
