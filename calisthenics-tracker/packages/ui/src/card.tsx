import type { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "./cn.js";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const paddingMap = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  className,
  padding = "md",
  interactive,
  ...props
}: CardProps) {
  const classes = cn(
    "cali-glass rounded-[var(--radius-cali-card)]",
    paddingMap[padding],
    className,
  );

  if (interactive) {
    return (
      <motion.div
        className={classes}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        {...(props as object)}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
