import { motion } from "framer-motion";
import { cn } from "./cn.js";

interface PinDotsProps {
  length: number;
  max: number;
  shake?: boolean;
}

export function PinDots({ length, max, shake }: PinDotsProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-4"
      animate={shake ? { x: [-10, 10, -8, 8, 0] } : {}}
      transition={{ duration: 0.45 }}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < length;
        return (
          <motion.div
            key={i}
            className={cn(
              "rounded-full",
              filled ? "bg-cali-accent" : "bg-white/15",
            )}
            initial={false}
            animate={{
              width: filled ? 14 : 12,
              height: filled ? 14 : 12,
              scale: filled ? 1.1 : 1,
              boxShadow: filled
                ? "0 0 12px rgba(59,130,246,0.5)"
                : "0 0 0 transparent",
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          />
        );
      })}
    </motion.div>
  );
}
