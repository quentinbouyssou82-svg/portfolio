"use client";

import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

type WordToken = {
  text: string;
  className?: string;
  breakAfter?: boolean;
};

type HeroHeadlineProps = {
  words: WordToken[];
  className?: string;
  as?: "h1" | "h2";
};

export function HeroHeadline({
  words,
  className,
  as: Tag = "h1",
}: HeroHeadlineProps) {
  return (
    <ScrollReveal as="div" className="reveal-words" threshold={0.2}>
      <Tag className={cn("hero-display text-balance", className)}>
        {words.map((word, i) => (
          <span key={`${word.text}-${i}`} className="inline">
            <span
              className={cn("reveal-word inline-block", word.className)}
              style={{ "--word-index": i } as React.CSSProperties}
            >
              {word.text}
            </span>
            {i < words.length - 1 ? "\u00A0" : ""}
            {word.breakAfter ? <br className="hidden sm:block" /> : null}
          </span>
        ))}
      </Tag>
    </ScrollReveal>
  );
}
