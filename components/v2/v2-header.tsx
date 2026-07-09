"use client";

import { motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { V2_MOTION, V2_EASE } from "@/lib/v2-motion";

type V2HeaderProps = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onNavigate: (sectionId: string) => void;
};

const navLinks = [
  { id: "projects", label: "Projets" },
  { id: "services", label: "Services" },
  { id: "pricing", label: "Tarifs" },
  { id: "about", label: "Agence" },
  { id: "contact", label: "Contact" },
];

export function V2Header({ theme, onToggleTheme, onNavigate }: V2HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function navigate(sectionId: string) {
    setMenuOpen(false);
    onNavigate(sectionId);
  }

  return (
    <>
      <header className="v2-header" data-scrolled={scrolled}>
        <div className="v2-wrap v2-header-inner">
          <button type="button" onClick={() => navigate("hero")} className="v2-logo">
            Nocta
          </button>

          <nav className="v2-nav" aria-label="Navigation principale">
            {navLinks.map((link) => (
              <button key={link.id} type="button" onClick={() => navigate(link.id)}>
                {link.label}
              </button>
            ))}
            <button type="button" onClick={() => navigate("contact")} className="v2-nav-cta">
              Devis rapide →
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="v2-btn v2-btn-ghost !px-2"
              aria-label="Changer le thème"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </nav>

          <div className="v2-hide-md flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="v2-btn v2-btn-ghost !px-2"
              aria-label="Changer le thème"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="v2-btn v2-btn-ghost !px-2"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <motion.nav
          className="v2-mobile-nav v2-hide-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-label="Menu mobile"
        >
          {navLinks.map((link, i) => (
            <motion.button
              key={link.id}
              type="button"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: V2_MOTION.duration.normal, ease: V2_EASE }}
              onClick={() => navigate(link.id)}
              className="block w-full border-b border-[var(--v2-border)] py-4 text-left text-lg font-medium"
            >
              {link.label}
            </motion.button>
          ))}
          <button
            type="button"
            onClick={() => navigate("contact")}
            className="v2-btn v2-btn-gold mt-8 w-full"
          >
            Devis rapide
          </button>
        </motion.nav>
      ) : null}
    </>
  );
}
