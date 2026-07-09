"use client";

import { useEffect, useState } from "react";
import { scrollToId } from "@/lib/utils";

const links = [
  { label: "Expertise", id: "expertise" },
  { label: "Approche", id: "approche" },
  { label: "Crédibilité", id: "credibilite" },
  { label: "Contact", id: "contact" },
];

export function MeridianNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`mc-nav fixed inset-x-0 top-0 z-50 ${scrolled ? "scrolled" : ""}`}
    >
      <div className="meridian-wrap flex h-[4.25rem] items-center justify-between md:h-[5rem]">
        <button type="button" onClick={() => scrollToId("hero")} className="mc-logo">
          Meridian<span className="mc-gold-text">.</span>
        </button>

        <nav className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollToId(link.id)}
              className="mc-nav-link"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => scrollToId("contact")}
          className="mc-btn mc-btn-primary hidden px-6 py-2.5 md:inline-flex"
        >
          Rendez-vous
        </button>
      </div>
    </header>
  );
}
