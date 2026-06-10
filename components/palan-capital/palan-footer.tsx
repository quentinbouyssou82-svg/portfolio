import Link from "next/link";
import { NAV_LINKS, PALAN_BASE } from "@/lib/palan-capital/constants";

export function PalanFooter() {
  return (
    <footer className="bg-[var(--palan-navy)] px-5 py-16 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-[90rem] gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] lg:gap-20">
        <div>
          <div className="font-display text-base font-semibold uppercase tracking-[0.14em] text-white">
            Palan <span className="text-[var(--palan-gold)]">Capital</span>
          </div>
          <p className="mt-4 max-w-md text-[0.75rem] leading-[1.9] text-white/30">
            Cabinet indépendant d&apos;ingénierie financière et de structuration patrimoniale.
            France · Luxembourg · Émirats Arabes Unis.
          </p>
          <p className="mt-6 text-[0.65rem] leading-[1.85] text-white/20">
            Site édité par SAS LIVING · nom commercial Palan Capital
            <br />
            SIREN 983 940 958 · RCS Toulouse
            <br />
            ORIAS en cours · Agrément CIF en cours
          </p>
        </div>

        <div>
          <div className="mb-5 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--palan-gold)] opacity-80">
            Expertises
          </div>
          <ul className="space-y-3">
            {NAV_LINKS.slice(0, 4).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.75rem] text-white/35 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-5 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--palan-gold)] opacity-80">
            Cabinet
          </div>
          <ul className="space-y-3">
            <li>
              <Link
                href={`${PALAN_BASE}/cabinet`}
                className="text-[0.75rem] text-white/35 transition-colors hover:text-white"
              >
                Qui sommes-nous
              </Link>
            </li>
            <li>
              <Link
                href={`${PALAN_BASE}/contact`}
                className="text-[0.75rem] text-white/35 transition-colors hover:text-white"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href={`${PALAN_BASE}/mentions-legales`}
                className="text-[0.75rem] text-white/35 transition-colors hover:text-white"
              >
                Mentions légales
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[90rem] flex-col gap-4 border-t border-[var(--palan-line)] pt-8 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[0.65rem] text-white/20">© 2026 Palan Capital — Tous droits réservés.</span>
        <div className="flex gap-6">
          <Link
            href={`${PALAN_BASE}/mentions-legales`}
            className="text-[0.65rem] text-white/20 transition-colors hover:text-[var(--palan-gold)]"
          >
            Mentions légales
          </Link>
          <Link
            href={`${PALAN_BASE}/mentions-legales#confidentialite`}
            className="text-[0.65rem] text-white/20 transition-colors hover:text-[var(--palan-gold)]"
          >
            Confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}
