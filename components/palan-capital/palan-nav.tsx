"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, PALAN_BASE } from "@/lib/palan-capital/constants";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-5" aria-hidden>
      <span
        className={`absolute left-0 top-0 h-px w-full bg-[var(--palan-navy)] transition-all duration-200 ${
          open ? "top-[6px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[6px] h-px w-full bg-[var(--palan-navy)] transition-all duration-200 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`absolute bottom-0 left-0 h-px w-full bg-[var(--palan-navy)] transition-all duration-200 ${
          open ? "bottom-[6px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function PalanNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("palan-nav-open", open);
    return () => document.body.classList.remove("palan-nav-open");
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--palan-line)] bg-[var(--palan-ivory)]">
      <div className="mx-auto flex h-[4.5rem] max-w-[90rem] items-center justify-between px-5 md:px-10 lg:px-16">
        <Link
          href={PALAN_BASE}
          className="font-display text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-[var(--palan-navy)]"
        >
          Palan <span className="text-[var(--palan-gold)]">Capital</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[0.68rem] uppercase tracking-[0.12em] transition-opacity hover:opacity-100 ${
                  active ? "opacity-100" : "opacity-55"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href={`${PALAN_BASE}/contact`}
            className={`border border-[var(--palan-gold)] px-5 py-2 text-[0.68rem] uppercase tracking-[0.12em] transition-colors hover:bg-[var(--palan-gold)] hover:text-white ${
              pathname === `${PALAN_BASE}/contact` ? "bg-[var(--palan-gold)] text-white" : ""
            }`}
          >
            Prendre contact
          </Link>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href={`${PALAN_BASE}/contact`}
            className="hidden border border-[var(--palan-gold)] px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] sm:inline-block"
          >
            Contact
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center"
            aria-expanded={open}
            aria-controls="palan-mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      <div
        id="palan-mobile-menu"
        className={`border-t border-[var(--palan-line)] bg-[var(--palan-ivory)] lg:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav className="flex flex-col px-5 py-4" aria-label="Navigation mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-[var(--palan-line)] py-4 text-[0.72rem] uppercase tracking-[0.12em] last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={`${PALAN_BASE}/contact`}
            className="mt-4 bg-[var(--palan-gold)] px-5 py-3 text-center text-[0.68rem] uppercase tracking-[0.12em] text-white"
          >
            Prendre contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
