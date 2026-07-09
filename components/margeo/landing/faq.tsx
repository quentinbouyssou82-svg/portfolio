"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/margeo/reveal";
import { cn } from "@/lib/margeo/utils";

const FAQ_ITEMS = [
  {
    question: "Comment Uberly lit-il mes captures d'écran ?",
    answer:
      "Notre moteur d'analyse extrait automatiquement le gain proposé, la distance, le temps estimé et les adresses depuis la capture. Tu n'as rien à saisir : tu déposes l'image, le verdict arrive en quelques secondes.",
  },
  {
    question: "Quelles plateformes sont compatibles ?",
    answer:
      "Uber Eats, Deliveroo, Shopopop, Stuart et Amazon Flex sont supportés. Nous ajoutons régulièrement de nouvelles plateformes en fonction des demandes de la communauté.",
  },
  {
    question: "Comment le gain net est-il calculé ?",
    answer:
      "Uberly applique ton coût au kilomètre (carburant, usure, assurance) sur la distance totale — retour à vide inclus — et ajoute un coût du temps immobilisé. Le résultat, c'est ce qui reste vraiment dans ta poche.",
  },
  {
    question: "Est-ce que ça marche pendant le compte à rebours ?",
    answer:
      "Oui, c'est tout l'intérêt. L'analyse prend environ 2 secondes, ce qui te laisse le temps de décider avant l'expiration de la proposition.",
  },
  {
    question: "Mes données sont-elles partagées avec les plateformes ?",
    answer:
      "Jamais. Tes captures et tes statistiques restent privées. Uberly travaille pour toi, pas pour les plateformes.",
  },
  {
    question: "Uberly est-il vraiment gratuit ?",
    answer:
      "L'analyse de course est gratuite avec 5 analyses par jour. Le plan Premium débloque les analyses illimitées, les statistiques avancées et les recommandations de zones.",
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
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
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
    <section id="faq" className="scroll-mt-20 border-t border-mg-border py-24">
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
