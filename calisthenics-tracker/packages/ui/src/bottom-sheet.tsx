import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "./cn.js";

export interface BottomSheetProps {
  open: boolean;
  onClose?: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  className,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[min(100%,var(--width-cali-app-max))]",
              "cali-glass rounded-t-[1.5rem] border-b-0 px-6 pt-3",
              "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
              className,
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 380 }}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20" />
            <h3 className="cali-text-subtitle">{title}</h3>
            {subtitle && (
              <p className="cali-text-caption text-cali-text-muted mt-1">{subtitle}</p>
            )}
            <div className="mt-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
