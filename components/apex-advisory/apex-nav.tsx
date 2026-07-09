"use client";

import { useEffect, useState } from "react";
import { ApexLangSwitcher } from "./apex-lang-switcher";
import { ApexLogo } from "./apex-logo";
import { useApexLocale } from "./apex-locale-provider";
import { useApexScroll } from "./apex-motion-provider";

export function ApexNav() {
  const { t } = useApexLocale();
  const scroll = useApexScroll();
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
      <div className="apex-wrap flex h-[4.75rem] items-center justify-between gap-3 md:h-[5.5rem]">
        <button
          type="button"
          onClick={() => go("hero")}
          className="ax-logo"
          aria-label={t.nav.homeAria}
        >
          <ApexLogo variant="lockup" />
        </button>

        <nav className={`ax-nav-pill hidden items-center gap-1 lg:flex ${scrolled ? "is-visible" : ""}`}>
          {t.nav.links.map((link) => (
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

        <div className="flex items-center gap-2 sm:gap-3">
          <ApexLangSwitcher />
          <button
            type="button"
            onClick={() => go("contact")}
            className="ax-btn ax-btn-primary hidden px-5 py-2.5 text-[0.5rem] lg:inline-flex"
          >
            {t.nav.cta}
          </button>
        </div>
      </div>
    </header>
  );
}
