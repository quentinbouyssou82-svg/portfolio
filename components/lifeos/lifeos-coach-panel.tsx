"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { COACH_MESSAGES } from "@/lib/lifeos/constants";

export function LifeOSCoachPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl lifeos-gradient-purple text-white shadow-md">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="text-sm font-bold">Coach</p>
          <p className="text-xs text-[var(--lifeos-muted)]">Your life companion</p>
        </div>
      </div>

      {COACH_MESSAGES.map((msg, i) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="lifeos-coach-bubble p-4"
        >
          <p className="text-sm leading-relaxed">{msg.text}</p>
        </motion.div>
      ))}

      {!compact && (
        <div className="rounded-2xl border border-[var(--lifeos-border)] bg-[var(--lifeos-bg)] p-3">
          <input
            type="text"
            placeholder="Ask your coach..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--lifeos-muted)]"
            readOnly
          />
        </div>
      )}
    </div>
  );
}
