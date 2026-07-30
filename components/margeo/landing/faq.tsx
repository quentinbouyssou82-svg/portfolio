"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/margeo/reveal";
import { DRIVEELY_FAQ_ITEMS } from "@/lib/margeo/landing-faq";
import { cn } from "@/lib/margeo/utils";

const FAQ_ITEMS = DRIVEELY_FAQ_ITEMS;

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
        type="button"
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
      {/* Answers stay in the DOM for crawlers / GEO even when visually collapsed */}
      <motion.div
        initial={false}
        animate={
          open
            ? { height: "auto", opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="overflow-hidden"
        aria-hidden={!open}
      >
        <p className="pb-5 pr-10 text-sm leading-relaxed text-mg-muted">
          {answer}
        </p>
      </motion.div>
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
          <h2 className="text-gradient mt-3 text-2xl font-bold tracking-tight text-mg-foreground leading-[1.25] sm:text-4xl sm:leading-[1.2]">
            Questions fréquentes
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-mg-muted sm:text-base">
            Gain net, coût au km, Uber Eats / Deliveroo — réponses claires avant
            de t&apos;inscrire.
          </p>
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
