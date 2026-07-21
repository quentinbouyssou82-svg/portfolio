"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/margeo/reveal";
import { cn } from "@/lib/margeo/utils";

const FAQ_ITEMS = [
  {
    question: "Comment Uberly lit ma capture ?",
    answer:
      "L'IA extrait le gain, la distance, le temps et les adresses. Tu déposes l'image, le verdict arrive en quelques secondes. Aucune saisie.",
  },
  {
    question: "Quelles plateformes sont compatibles ?",
    answer:
      "Uber Eats, Deliveroo, Stuart et Amazon Flex dès aujourd'hui. Just Eat et Glovo sont sur la feuille de route selon la demande beta.",
  },
  {
    question: "Comment le gain net est calculé ?",
    answer:
      "Uberly déduit tes coûts au km (essence, usure, assurance) sur la distance totale — retour à vide inclus — plus le temps immobilisé. Ce qui reste, c'est ton vrai gain.",
  },
  {
    question: "Ça marche pendant le compte à rebours ?",
    answer:
      "Oui. L'analyse prend ~8 secondes. Tu décides avant l'expiration de la proposition.",
  },
  {
    question: "Mes données sont partagées avec les plateformes ?",
    answer:
      "Non. Tes captures et tes stats restent privées. Uberly travaille pour toi.",
  },
  {
    question: "C'est gratuit ?",
    answer:
      "Oui. Le plan Découverte offre 2 analyses/jour pour tester. Le plan Pro (4,99 €/mois) débloque analyses illimitées, dashboard et zones rentables — c'est l'offre faite pour livrer au quotidien. Elite ajoute export et stats avancées.",
  },
];

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-mg-border last:border-b-0">
      <button
        onClick={onToggle}
        className="faq-item-btn flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left outline-none sm:py-5"
        aria-expanded={open}
      >
        <span className="font-medium text-mg-foreground">{question}</span>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full border border-mg-border bg-[var(--mg-surface-muted)] transition-all duration-300",
            open && "border-mg-accent/40 bg-mg-accent-soft rotate-45",
          )}
        >
          <Plus
            className={cn(
              "size-3.5 text-mg-muted transition-colors duration-300",
              open && "text-mg-accent",
            )}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <p className="pb-5 pr-10 text-sm leading-relaxed text-mg-muted">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-24 py-16 sm:py-24 lg:py-28">
      <div className="section-bridge mb-12 sm:mb-16" aria-hidden />
      <div className="mx-auto max-w-3xl px-5">
        <Reveal className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-mg-accent uppercase">
            FAQ
          </p>
          <h2 className="text-gradient mt-3 text-2xl font-bold tracking-tight text-mg-foreground sm:text-4xl">
            Questions fréquentes
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="faq-panel mt-10 px-5 sm:mt-14 sm:px-7">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={item.question}
              {...item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
