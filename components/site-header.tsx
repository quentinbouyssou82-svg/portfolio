"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
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

export function SiteHeader({ theme, onToggleTheme, onNavigate }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="site-header-shell fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="site-header mx-auto flex h-14 max-w-6xl items-center justify-between rounded-3xl px-5 md:h-[3.75rem] md:rounded-[1.75rem] md:px-7"
        >
          <button
            type="button"
            onClick={() => navigate("hero")}
            className="text-xl font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            Nocta Agency
          </button>

          {/* Desktop nav — unchanged at lg+ */}
          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate("pricing")}>
              Tarifs
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("contact")}>
              Devis rapide
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTheme}
              aria-label="Changer le thème"
            >
              {theme === "dark" ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          {/* Mobile / tablet controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleTheme}
              aria-label="Changer le thème"
              className="touch-target-sm"
            >
              {theme === "dark" ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="touch-target-sm"
            >
              {menuOpen ? (
                <X className="size-4" aria-hidden="true" />
              ) : (
                <Menu className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </motion.header>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mobile-nav-backdrop fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              id="mobile-nav"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mobile-nav-panel fixed inset-y-0 right-0 z-50 flex w-[min(100%,20rem)] flex-col gap-2 border-l border-[var(--border)] bg-[var(--surface-strong)] p-6 pt-24 shadow-2xl lg:hidden"
            >
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
                Navigation
              </p>
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => navigate(link.id)}
                  className={cn(
                    "mobile-nav-link touch-target rounded-xl px-4 py-3.5 text-left text-base font-medium",
                    "transition-colors hover:bg-[var(--surface)]",
                  )}
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-6">
                <Button
                  size="lg"
                  className="hero-cta-primary w-full"
                  onClick={() => navigate("contact")}
                >
                  Devis rapide
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("pricing")}
                >
                  Voir les tarifs
                </Button>
              </div>
            </motion.nav>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
