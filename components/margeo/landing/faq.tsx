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
      "Uber Eats, Deliveroo, Stuart et Amazon Flex. D'autres arrivent selon les retours de la communauté.",
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
      "5 analyses par jour, gratuites. Premium : analyses illimitées, stats avancées et zones recommandées.",
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
        className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 py-4 text-left outline-none sm:py-5"
        aria-expanded={open}
      >
        <span className="font-medium text-mg-foreground">{question}</span>
        <Plus
          className={cn(
            "size-4 shrink-0 text-mg-muted transition-transform duration-300",
            open && "rotate-45 text-mg-accent"
          )}
        />
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
            <p className="pb-5 text-sm leading-relaxed text-mg-muted">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-5">
        <Reveal className="text-center">
          <p className="text-sm font-semibold tracking-wide text-mg-accent uppercase">
            FAQ
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-mg-foreground sm:text-3xl">
            Questions fréquentes
          </h2>
        </Reveal>

        <Reveal
          delay={0.1}
          className="mt-12 rounded-2xl border border-mg-border bg-mg-card px-6 shadow-mg-card"
        >
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
