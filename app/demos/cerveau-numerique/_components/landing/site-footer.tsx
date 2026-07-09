import Link from "next/link";
import { Brain } from "lucide-react";

const CN = "/demos/cerveau-numerique";

const productLinks = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Produit", href: "#produit" },
  { label: "Se connecter", href: `${CN}/login` },
];

const legalLinks = [
  { label: "CGU", href: `${CN}/legal/cgu` },
  { label: "Confidentialité", href: `${CN}/legal/confidentialite` },
  { label: "DPA", href: `${CN}/legal/dpa` },
];

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <span className="inline-flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
              <Brain className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Cerveau Numérique
            </span>
          </span>
          <p className="mt-3 text-xs leading-relaxed text-[var(--cn-ghost)]">
            Ton assistant de vie personnel. Documents, mails, tâches et agenda
            — organisés automatiquement.
          </p>
        </div>

        <div className="flex gap-16">
          <div>
            <p className="cn-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cn-faint)]">
              Produit
            </p>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--cn-ghost)] transition-colors hover:text-[var(--cn-muted)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="cn-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cn-faint)]">
              Légal
            </p>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-[var(--cn-ghost)] transition-colors hover:text-[var(--cn-muted)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-5xl items-center justify-between border-t border-white/[0.05] pt-6">
        <p className="text-xs text-[var(--cn-ghost)]">
          © {new Date().getFullYear()} Mon Cerveau Numérique
        </p>
        <p className="text-xs text-[var(--cn-ghost)]">Fait en France 🇫🇷</p>
      </div>
    </footer>
  );
}
