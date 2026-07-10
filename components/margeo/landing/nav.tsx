"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/margeo/logo";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";

const LINKS = [
  { href: "#probleme", label: "Le problème" },
  { href: "#demo", label: "Démo" },
  { href: "#resultats", label: "Résultats" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-mg-border/80 bg-mg-background/75 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 pt-[env(safe-area-inset-top)]">
        <Link href={margeoRoutes.home} aria-label="Uberly — accueil">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-mg-muted transition-colors hover:bg-white/[0.05] hover:text-mg-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link href={margeoRoutes.login}>
            <Button variant="ghost" size="sm" className="min-h-10">
              Se connecter
            </Button>
          </Link>
          <Link href={margeoRoutes.signup}>
            <Button size="sm" className="landing-cta-primary min-h-10">
              Rejoindre la beta
              <ArrowRight />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-mg-muted transition-colors hover:bg-white/[0.05] hover:text-mg-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-mg-border bg-mg-background lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-sm text-mg-muted transition-colors hover:bg-white/[0.05] hover:text-mg-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={margeoRoutes.login}
                onClick={() => setOpen(false)}
                className="mt-2"
              >
                <Button variant="secondary" className="w-full min-h-11">
                  Se connecter
                </Button>
              </Link>
              <Link href={margeoRoutes.signup} onClick={() => setOpen(false)}>
                <Button className="landing-cta-primary w-full min-h-11">
                  Rejoindre la beta
                  <ArrowRight />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
