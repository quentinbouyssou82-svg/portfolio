"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  MessageSquareHeart,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { Button } from "@/components/margeo/ui/button";
import { PRODUCT_NAME } from "@/lib/margeo/brand";
import { margeoRoutes } from "@/lib/margeo/routes";

const CARDS = [
  {
    href: margeoRoutes.questionnaire,
    icon: ClipboardList,
    title: "Questionnaire produit",
    body: "20 questions pour nous dire ce qui compte vraiment. ~4 minutes.",
    cta: "Répondre",
    primary: true,
  },
  {
    href: margeoRoutes.beta,
    icon: Sparkles,
    title: "Programme bêta",
    body: "Mission, attentes et comment signaler un bug pendant les tests.",
    cta: "Voir le programme",
    primary: false,
  },
] as const;

/**
 * Hub Retour — point d'entrée unique vers questionnaire & programme bêta.
 * Accessible depuis l'app shell (pas depuis la landing publique).
 */
export function RetourHubPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-lg pb-6">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center"
      >
        <div className="mb-5 flex justify-center">
          <Logo withText={false} size="lg" />
        </div>
        <p className="inline-flex items-center gap-2 rounded-full border border-mg-accent/25 bg-mg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-mg-accent uppercase">
          <MessageSquareHeart className="size-3.5" />
          Retour
        </p>
        <h1 className="text-gradient mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Aide-nous à construire {PRODUCT_NAME}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mg-muted text-pretty sm:text-base">
          Plus besoin de Google Forms ni de Discord : envoie tes retours ici.
          C&apos;est notre canal principal pendant toute la bêta.
        </p>
      </motion.div>

      <div className="mt-10 space-y-3">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.href}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
          >
            <Link
              href={card.href}
              className="group flex items-start gap-4 rounded-2xl border border-mg-border bg-[var(--mg-surface-muted)] p-4 transition hover:border-mg-accent/35 hover:bg-mg-accent-soft/30"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-mg-border bg-mg-background text-mg-accent">
                <card.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-base font-semibold text-mg-foreground">
                  {card.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-mg-muted">
                  {card.body}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-mg-accent">
                  {card.cta}
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-mg-border/70 px-4 py-4 text-center">
        <p className="text-xs leading-relaxed text-mg-faint">
          Tes réponses restent liées à ton compte. Tu pourras les modifier plus
          tard. Elles servent uniquement à améliorer le produit.
        </p>
        <Link href={margeoRoutes.dashboard} className="mt-3 inline-block">
          <Button variant="ghost" size="sm">
            Retour à l&apos;app
          </Button>
        </Link>
      </div>
    </div>
  );
}
