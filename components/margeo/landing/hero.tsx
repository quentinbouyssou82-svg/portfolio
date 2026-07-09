"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";
import { PhoneMock } from "./phone-mock";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="bg-hero-glow relative overflow-hidden pt-36 pb-24">
      <div className="bg-grid absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-mg-accent/25 bg-mg-accent-soft px-3.5 py-1.5 text-xs font-medium text-mg-accent">
              <Sparkles className="size-3.5" />
              Le copilote IA des livreurs indépendants
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="text-gradient mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl"
          >
            Sache en 2 secondes si une course vaut{" "}
            <span className="text-gradient-accent">vraiment</span> le coup.
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-mg-muted text-pretty"
          >
            Capture la proposition, dépose-la dans Uberly. L&apos;IA extrait les
            infos, calcule ton gain net réel et te dit s&apos;il faut accepter —
            avant la fin du compte à rebours.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href={margeoRoutes.signup}>
              <Button size="lg">
                Rejoindre la beta
                <ArrowRight />
              </Button>
            </Link>
            <Link href={margeoRoutes.login}>
              <Button variant="secondary" size="lg">
                Se connecter
              </Button>
            </Link>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-4 text-xs text-mg-faint"
          >
            Gratuit · Sans carte bancaire · Uber Eats, Deliveroo, Stuart, Amazon Flex
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-20"
        >
          <PhoneMock />
        </motion.div>
      </div>
    </section>
  );
}
