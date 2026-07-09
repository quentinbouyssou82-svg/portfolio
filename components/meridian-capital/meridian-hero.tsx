"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRef } from "react";
import { scrollToId } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 36, scale: 1.03, filter: "blur(12px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  transition: { duration: 1.1, delay, ease: EASE },
});

export function MeridianHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-20"
    >
      <motion.div style={{ y, opacity, scale }} className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #121820 0%, #0d1015 45%, #0a0c10 100%)",
          }}
        />
        <div className="mc-aurora" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(36, 48, 64, 0.3) 0%, transparent 60%)",
          }}
        />
        <div className="mc-grain" />
      </motion.div>

      <div className="meridian-wrap relative z-10 py-28 md:py-36">
        <motion.p {...fadeUp(0.15)} className="mc-eyebrow">
          Ingénierie financière
        </motion.p>

        <motion.h1
          {...fadeUp(0.3)}
          className="font-display mc-display-lg mt-10 max-w-[18ch]"
        >
          Structurer. Optimiser.
          <br />
          <em className="mc-gold-text not-italic">Sécuriser le capital.</em>
        </motion.h1>

        <motion.p
          {...fadeUp(0.48)}
          className="mc-body mt-10 max-w-md text-[0.9375rem] md:max-w-lg md:text-base"
        >
          Expertise en ingénierie financière haut de gamme pour une clientèle
          exigeante — dirigeants, family offices et institutions.
        </motion.p>

        <motion.div
          {...fadeUp(0.62)}
          className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <button
            type="button"
            onClick={() => scrollToId("contact")}
            className="mc-btn mc-btn-primary"
          >
            Prendre rendez-vous
          </button>
          <button
            type="button"
            onClick={() => scrollToId("expertise")}
            className="mc-btn mc-btn-ghost"
          >
            Découvrir nos services
          </button>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToId("expertise")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1, ease: EASE }}
        className="absolute bottom-12 left-1/2 z-10 -translate-x-1/2 text-[var(--mc-text-muted)] transition-colors duration-500 hover:text-[var(--mc-gold-light)]"
        aria-label="Défiler vers le contenu"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-[1.125rem]" strokeWidth={1.25} />
        </motion.div>
      </motion.button>
    </section>
  );
}
