"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bug,
  Check,
  ClipboardList,
  MessageSquareHeart,
  MessageSquareWarning,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/margeo/ui/button";
import { DRIVEELY_CONTACT_EMAIL, PRODUCT_NAME } from "@/lib/margeo/brand";
import { getDriveelyAppVersion } from "@/lib/margeo/survey";
import { margeoRoutes } from "@/lib/margeo/routes";

const EXPECTATIONS = [
  {
    icon: Target,
    text: "Tester dans de vraies situations de livraison",
  },
  {
    icon: Bug,
    text: "Signaler les bugs dès qu'ils apparaissent",
  },
  {
    icon: MessageSquareWarning,
    text: "Dire clairement ce qui manque",
  },
  {
    icon: Check,
    text: "Partager un avis honnête, même critique",
  },
  {
    icon: Zap,
    text: "Nous dire si Driveely te fait gagner du temps ou de l'argent",
  },
] as const;

const bugMailto = `mailto:${DRIVEELY_CONTACT_EMAIL}?subject=${encodeURIComponent(
  `[Retour] Bug — ${PRODUCT_NAME}`,
)}`;

/**
 * Section Retour (ex-Programme Bêta) — hub in-app.
 * Questionnaire = canal principal ; le reste du programme est conservé dessous.
 */
export function RetourHubPage() {
  const reduceMotion = useReducedMotion();
  const version = getDriveelyAppVersion();

  return (
    <div className="mx-auto max-w-2xl pb-10">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-center"
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-mg-accent/25 bg-mg-accent-soft px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-mg-accent uppercase">
          <MessageSquareHeart className="size-3.5" />
          Retour
        </p>
        <h1 className="text-gradient mt-4 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Tes retours construisent {PRODUCT_NAME}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-mg-muted text-pretty sm:text-base">
          Plus de Google Forms ni de Discord. Ici, tu envoies questionnaire et
          signalements directement à l&apos;équipe — canal principal pendant la
          bêta.
        </p>
        <p className="mt-3 text-[11px] font-medium tracking-wide text-mg-faint uppercase">
          App v{version}
        </p>
      </motion.div>

      {/* Primary: Questionnaire */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="mt-8"
      >
        <Link
          href={margeoRoutes.questionnaire}
          className="group block rounded-2xl border border-mg-accent/35 bg-mg-accent-soft/40 p-5 transition hover:border-mg-accent/55 hover:bg-mg-accent-soft/60"
        >
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-mg-accent/30 bg-mg-background text-mg-accent">
              <ClipboardList className="size-6" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-lg font-semibold text-mg-foreground">
                Questionnaire produit
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-mg-muted">
                20 questions · ~4 min. Profil, usage, valeur, prix, satisfaction.
                Tu peux modifier tes réponses plus tard.
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mg-accent">
                Répondre au questionnaire
                <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Secondary actions */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <a
          href={bugMailto}
          className="flex items-center gap-3 rounded-2xl border border-mg-border bg-[var(--mg-surface-muted)] p-4 transition hover:border-mg-accent/30"
        >
          <Bug className="size-5 shrink-0 text-mg-accent" />
          <span className="text-left">
            <span className="block text-sm font-semibold text-mg-foreground">
              Signaler un bug
            </span>
            <span className="block text-xs text-mg-muted">Email rapide</span>
          </span>
        </a>
        <Link
          href={margeoRoutes.analyse}
          className="flex items-center gap-3 rounded-2xl border border-mg-border bg-[var(--mg-surface-muted)] p-4 transition hover:border-mg-accent/30"
        >
          <Zap className="size-5 shrink-0 text-mg-accent" />
          <span className="text-left">
            <span className="block text-sm font-semibold text-mg-foreground">
              Continuer les tests
            </span>
            <span className="block text-xs text-mg-muted">Lancer une analyse</span>
          </span>
        </Link>
      </div>

      {/* Expectations — contenu programme conservé */}
      <section className="mt-12">
        <p className="text-xs font-semibold tracking-[0.18em] text-mg-accent uppercase">
          Ce qu&apos;on attend de toi
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-mg-foreground">
          Toujours le même programme
        </h2>
        <ul className="mt-5 space-y-2.5">
          {EXPECTATIONS.map((item) => (
            <li
              key={item.text}
              className="flex items-start gap-3 rounded-xl border border-mg-border/70 bg-[var(--mg-surface-muted)]/60 px-3.5 py-3"
            >
              <item.icon className="mt-0.5 size-4 shrink-0 text-mg-accent" />
              <span className="text-sm leading-snug text-mg-muted">{item.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 rounded-2xl border border-mg-border/70 px-4 py-4 text-center">
        <p className="text-xs leading-relaxed text-mg-faint">
          Merci de participer à la création de {PRODUCT_NAME}. Chaque retour aide
          directement au développement.
        </p>
        <Link href={margeoRoutes.dashboard} className="mt-3 inline-block">
          <Button variant="ghost" size="sm">
            Retour au dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
