"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/margeo/ui/button";
import { PAYWALL_COPY } from "@/lib/margeo/paywall/config";
import {
  DRIVEELY_PLANS,
  formatPlanPrice,
} from "@/lib/margeo/plans";

export function ExitOffer({
  open,
  onClose,
  onMonthly,
  onFree,
}: {
  open: boolean;
  onClose: () => void;
  onMonthly: () => void;
  onFree: () => void;
}) {
  const pro = DRIVEELY_PLANS.pro;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="paywall-exit-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="paywall-exit-title"
            className="paywall-exit-sheet w-full max-w-md rounded-3xl border border-mg-border bg-mg-card p-5 shadow-2xl sm:p-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  id="paywall-exit-title"
                  className="text-lg font-semibold tracking-tight text-mg-foreground"
                >
                  {PAYWALL_COPY.exitTitle}
                </p>
                <p className="mt-1 text-sm text-mg-muted">
                  {PAYWALL_COPY.exitSubtitle}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-1.5 text-mg-faint transition hover:bg-[var(--mg-nav-hover)] hover:text-mg-foreground"
                onClick={onClose}
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-mg-foreground/90">
              <li className="flex gap-2">
                <span className="text-mg-accent">✓</span>
                Offre mensuelle Pro — {formatPlanPrice(pro.priceMonthly)}/mois
              </li>
              <li className="flex gap-2">
                <span className="text-mg-accent">✓</span>
                Essai 14 jours toujours inclus
              </li>
              <li className="flex gap-2">
                <span className="text-mg-accent">✓</span>
                Ou rester en Découverte, sans pression
              </li>
            </ul>

            <div className="mt-6 space-y-2.5">
              <Button className="app-cta-primary w-full min-h-11" onClick={onMonthly}>
                {PAYWALL_COPY.exitMonthly}
              </Button>
              <Button
                variant="ghost"
                className="w-full min-h-10 text-mg-muted"
                onClick={onFree}
              >
                {PAYWALL_COPY.exitFree}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
