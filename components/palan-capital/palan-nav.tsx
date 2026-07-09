"use client";

import { useEffect, useState } from "react";
import { usePalanScroll } from "./palan-motion-provider";

const links = [
  { label: "Expertises", id: "expertises" },
  { label: "Convictions", id: "convictions" },
  { label: "Audiences", id: "audiences" },
  { label: "Contact", id: "contact" },
];

export function PalanNav() {
  const scroll = usePalanScroll();
  const [scrolled, setScrolled] = useState(false);
  const go = (id: string) => scroll?.scrollTo(`#${id}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`ax-nav fixed inset-x-0 top-0 z-50 ${scrolled ? "scrolled" : ""}`}>
      <div className="apex-wrap flex h-[4.5rem] items-center justify-between md:h-[5.25rem]">
        <button type="button" onClick={() => go("hero")} className="ax-logo">
          Palan<span className="ax-gold-text"> Capital</span>
        </button>

        <nav className={`ax-nav-pill hidden items-center gap-1 lg:flex ${scrolled ? "is-visible" : ""}`}>
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => go(link.id)}
              className="ax-nav-link"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => go("contact")}
          className="ax-btn ax-btn-primary hidden px-5 py-2.5 text-[0.5rem] lg:inline-flex"
        >
          Entretien
        </button>
      </div>
    </header>
  );
}
