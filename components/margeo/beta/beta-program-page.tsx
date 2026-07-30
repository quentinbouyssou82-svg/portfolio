"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Bug,
  Check,
  FlaskConical,
  Heart,
  Mail,
  MessageSquareWarning,
  Plus,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { JoinBetaCta } from "@/components/margeo/beta/join-beta-cta";
import { Logo } from "@/components/margeo/logo";
import { Reveal } from "@/components/margeo/reveal";
import { Button } from "@/components/margeo/ui/button";
import { DRIVEELY_CONTACT_EMAIL, PRODUCT_NAME } from "@/lib/margeo/brand";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

const MISSION_STEPS = [
  {
    step: "01",
    title: "Utilise Driveely en livraison",
    body: "Ouvre l'app pendant de vraies courses — c'est là que ça compte.",
  },
  {
    step: "02",
    title: "Analyse plusieurs propositions",
    body: "Accepte, refuse, compare. Plus tu testes, plus on apprend.",
  },
  {
    step: "03",
    title: "Signale bugs et comportements étranges",
    body: "Capture, message court, contexte. On traite chaque signal.",
  },
  {
    step: "04",
    title: "Donne ton avis après une semaine",
    body: "Ce qui t'a fait gagner du temps — ou ce qui t'a freiné.",
  },
] as const;

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
    text: "Nous dire si Driveely te ferait gagner du temps ou de l'argent",
  },
] as const;

const BENEFITS = [
  {
    icon: Rocket,
    title: "Accès anticipé",
    body: "Utilise Driveely avant le lancement public.",
  },
  {
    icon: Sparkles,
    title: "Influence directe",
    body: "Tes retours orientent la roadmap produit.",
  },
  {
    icon: FlaskConical,
    title: "Évolutions prioritaires",
    body: "Les correctifs et idées bêta passent en premier.",
  },
  {
    icon: Shield,
    title: "Tarif préférentiel",
    body: "Conservé après le lancement si tu restes utilisateur.",
  },
] as const;

const LIMITS = [
  "Le produit évolue rapidement.",
  "Certaines fonctionnalités peuvent changer.",
  "Quelques bugs peuvent encore exister.",
  "Les performances peuvent évoluer d'une version à l'autre.",
] as const;

const FAQ_ITEMS = [
  {
    q: "Pourquoi une bêta ?",
    a: "Pour construire Driveely avec de vrais livreurs, pas en chambre. On préfère itérer vite sur le terrain plutôt que de peaufiner pendant des mois sans retour.",
  },
  {
    q: "Combien de temps dure-t-elle ?",
    a: "La bêta privée se poursuit jusqu'au lancement officiel. La durée exacte dépend des retours et de la stabilité du produit — on te préviendra avant la fin.",
  },
  {
    q: "Les données sont-elles privées ?",
    a: "Oui. Tes captures et stats restent privées. Driveely n'est affilié à aucune plateforme de livraison et ne partage pas tes données avec elles.",
  },
  {
    q: "Que deviennent mes retours ?",
    a: "Chaque retour est lu. Les bugs sont priorisés, les idées utiles entrent dans la roadmap. Tu peux suivre les évolutions dans les mises à jour produit.",
  },
  {
    q: "Puis-je arrêter quand je veux ?",
    a: "Oui. Aucun engagement. Tu peux quitter la bêta ou supprimer ton compte à tout moment.",
  },
  {
    q: "Le tarif préférentiel est-il garanti ?",
    a: "Oui pour les bêta-testeurs actifs qui restent utilisateurs au lancement. Les détails seront confirmés avant la fin de la bêta — sans mauvaise surprise.",
  },
] as const;

const bugMailto = `mailto:${DRIVEELY_CONTACT_EMAIL}?subject=${encodeURIComponent(
  `[Bêta] Bug — ${PRODUCT_NAME}`,
)}`;

function BetaFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-panel overflow-hidden rounded-2xl border border-mg-border">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="border-b border-mg-border last:border-b-0"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="faq-item-btn flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left outline-none sm:px-6 sm:py-5"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-mg-foreground">{item.q}</span>
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border border-mg-border bg-[var(--mg-surface-muted)] transition-all duration-300",
                  isOpen && "border-mg-accent/40 bg-mg-accent-soft rotate-45",
                )}
              >
                <Plus
                  className={cn(
                    "size-3.5 text-mg-muted transition-colors",
                    isOpen && "text-mg-accent",
                  )}
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-mg-muted sm:px-6">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export function BetaProgramPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="beta-program relative min-h-dvh overflow-x-clip">
      <div className="beta-program-glow" aria-hidden />

      <header className="relative z-10 border-b border-mg-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href={margeoRoutes.home} aria-label={`${PRODUCT_NAME} — accueil`}>
            <Logo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="beta-status-pill hidden items-center gap-2 sm:inline-flex">
              <span className="beta-status-dot" aria-hidden />
              En cours
            </span>
            <span className="rounded-full border border-mg-border bg-[var(--mg-surface-muted)] px-3 py-1 text-[11px] font-semibold tracking-wide text-mg-muted">
              Beta 0.1
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-5 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-mg-accent/25 bg-mg-accent-soft px-3.5 py-1.5 text-xs font-semibold tracking-[0.18em] text-mg-accent uppercase">
              <FlaskConical className="size-3.5" aria-hidden />
              Programme bêta
            </p>
            <h1 className="text-gradient mt-6 text-[2.35rem] leading-[1.12] font-bold tracking-tight text-balance sm:text-5xl sm:leading-[1.1] lg:text-[3.25rem]">
              Programme Bêta {PRODUCT_NAME}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mg-muted text-pretty sm:text-lg">
              Merci de participer à la création de {PRODUCT_NAME}. Tu fais partie
              des premiers utilisateurs qui construisent le meilleur assistant IA
              pour les livreurs.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <JoinBetaCta label="Rejoindre la bêta" />
              <Link href={margeoRoutes.analyse} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full min-h-12 sm:min-w-[200px]"
                >
                  Commencer les tests
                  <ArrowRight />
                </Button>
              </Link>
              <a href={bugMailto} className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full min-h-12 sm:min-w-[200px]"
                >
                  <Bug className="size-4" />
                  Signaler un bug
                </Button>
              </a>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-mg-faint sm:hidden">
              <span className="beta-status-dot" aria-hidden />
              Programme en cours · Beta 0.1
            </p>
          </motion.div>
        </section>

        {/* Pourquoi */}
        <section className="border-t border-mg-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5 text-center">
            <Reveal>
              <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
                Intention
              </p>
              <h2 className="text-gradient mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Pourquoi une bêta ?
              </h2>
              <p className="mt-5 text-base leading-relaxed text-mg-muted text-pretty sm:text-lg">
                Construire le meilleur produit possible grâce aux retours de vrais
                livreurs. On préfère lancer tôt et améliorer avec vous, plutôt que
                développer pendant des mois sans retour terrain.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Mission timeline */}
        <section className="border-t border-mg-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
                Mission
              </p>
              <h2 className="text-gradient mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Votre mission
              </h2>
              <p className="mt-4 text-base text-mg-muted">
                Quatre gestes simples. Zéro jargon.
              </p>
            </Reveal>

            <ol className="relative mx-auto mt-12 max-w-2xl space-y-0">
              {MISSION_STEPS.map((item, i) => (
                <Reveal key={item.step} delay={i * 0.06}>
                  <li className="beta-mission-step relative flex gap-4 pb-10 last:pb-0 sm:gap-5">
                    <div className="flex flex-col items-center">
                      <span className="beta-mission-num">{item.step}</span>
                      {i < MISSION_STEPS.length - 1 ? (
                        <span className="beta-mission-line" aria-hidden />
                      ) : null}
                    </div>
                    <div className="min-w-0 pt-1">
                      <h3 className="text-lg font-semibold tracking-tight text-mg-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-mg-muted">
                        {item.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Expectations */}
        <section className="border-t border-mg-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
                Attentes
              </p>
              <h2 className="text-gradient mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Ce que nous attendons
              </h2>
            </Reveal>

            <ul className="mx-auto mt-12 grid max-w-3xl gap-3">
              {EXPECTATIONS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.text} delay={i * 0.04}>
                    <li className="beta-expect-row">
                      <span className="beta-expect-icon">
                        <Icon className="size-4 text-mg-accent" aria-hidden />
                      </span>
                      <span className="text-sm font-medium text-mg-foreground sm:text-[0.9375rem]">
                        {item.text}
                      </span>
                    </li>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-mg-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
                Contrepartie
              </p>
              <h2 className="text-gradient mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Ce que vous obtenez
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((b, i) => {
                const Icon = b.icon;
                return (
                  <Reveal key={b.title} delay={i * 0.05}>
                    <article className="beta-benefit-card h-full">
                      <span className="beta-benefit-icon">
                        <Icon className="size-4 text-mg-accent" aria-hidden />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-mg-foreground">
                        {b.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-mg-muted">
                        {b.body}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Limits */}
        <section className="border-t border-mg-border/50 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5">
            <Reveal>
              <div className="beta-limits-card">
                <p className="text-xs font-semibold tracking-[0.18em] text-mg-faint uppercase">
                  Limites de la bêta
                </p>
                <ul className="mt-4 space-y-2.5">
                  {LIMITS.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2.5 text-sm text-mg-muted"
                    >
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-mg-faint" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-mg-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <Reveal>
              <div className="beta-contact-card text-center sm:text-left">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
                      Contact
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-mg-foreground sm:text-3xl">
                      Comment nous contacter
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-mg-muted">
                      Chaque retour est lu. Chaque bug est analysé. Nous répondons
                      le plus rapidement possible.
                    </p>
                  </div>
                  <a
                    href={`mailto:${DRIVEELY_CONTACT_EMAIL}`}
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-mg-accent/30 bg-mg-accent-soft px-5 py-4 text-sm font-semibold text-mg-accent transition hover:border-mg-accent/50"
                  >
                    <Mail className="size-4" />
                    {DRIVEELY_CONTACT_EMAIL}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-mg-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-5">
            <Reveal className="text-center">
              <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
                FAQ
              </p>
              <h2 className="text-gradient mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Questions fréquentes
              </h2>
            </Reveal>
            <div className="mt-10">
              <BetaFaq />
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-mg-border/50 py-16 sm:py-20">
          <div className="mx-auto max-w-xl px-5 text-center">
            <Reveal>
              <p className="text-lg font-medium text-mg-foreground text-pretty sm:text-xl">
                Merci de construire {PRODUCT_NAME} avec nous.
              </p>
              <p className="mt-2 text-mg-accent" aria-hidden>
                <Heart className="mx-auto size-5 fill-current" />
              </p>
              <Link href={margeoRoutes.analyse} className="mt-8 inline-block">
                <Button size="lg" className="landing-cta-primary min-h-12 px-8">
                  Commencer les tests
                  <ArrowRight />
                </Button>
              </Link>
              <p className="mt-6 text-xs text-mg-faint">
                <Link
                  href={margeoRoutes.conditionsBeta}
                  className="underline-offset-2 hover:text-mg-muted hover:underline"
                >
                  Conditions de la bêta privée
                </Link>
              </p>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
