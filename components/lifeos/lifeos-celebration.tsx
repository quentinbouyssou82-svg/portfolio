"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useLifeOS } from "@/lib/lifeos/provider";

export function LifeOSCelebration() {
  const { celebration, clearCelebration } = useLifeOS();

  useEffect(() => {
    if (!celebration) return;
    const t = setTimeout(clearCelebration, celebration.type === "level" ? 2500 : 1500);
    return () => clearTimeout(t);
  }, [celebration, clearCelebration]);

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearCelebration}
        >
          {celebration.type === "level" ? (
            <motion.div
              className="lifeos-gradient-level rounded-3xl px-12 py-10 text-center text-white shadow-2xl"
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <p className="text-sm font-semibold uppercase tracking-widest opacity-90">
                Level up!
              </p>
              <p className="mt-2 text-5xl font-extrabold">{celebration.message}</p>
              <p className="mt-3 text-sm opacity-90">New perk: +1 Streak Freeze</p>
            </motion.div>
          ) : (
            <motion.div
              className="pointer-events-none text-4xl font-extrabold text-[var(--lifeos-purple-light)] drop-shadow-lg"
              initial={{ y: 40, opacity: 0, scale: 0.8 }}
              animate={{ y: -80, opacity: 1, scale: 1.2 }}
              exit={{ y: -120, opacity: 0 }}
            >
              +{celebration.amount} XP
            </motion.div>
          )}

          {celebration.type === "xp" && (
            <>
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute size-2 rounded-full"
                  style={{
                    background: ["#8B5CF6", "#FF6B35", "#58CC02", "#F59E0B"][i % 4],
                    left: `${20 + (i % 6) * 12}%`,
                    top: `${30 + Math.floor(i / 6) * 20}%`,
                  }}
                  initial={{ y: 0, opacity: 1 }}
                  animate={{ y: -100, opacity: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.04 }}
                />
              ))}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
