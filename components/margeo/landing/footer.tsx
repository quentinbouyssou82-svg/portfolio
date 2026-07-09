import Link from "next/link";
import { Logo } from "@/components/margeo/logo";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Analyser une course", href: "/analyse" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Premium", href: "/premium" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Plateformes",
    links: [
      { label: "Uber Eats", href: "/#fonctionnalites" },
      { label: "Deliveroo", href: "/#fonctionnalites" },
      { label: "Shopopop", href: "/#fonctionnalites" },
      { label: "Stuart", href: "/#fonctionnalites" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Confidentialité", href: "/" },
      { label: "Mentions légales", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-mg-border bg-mg-surface/60">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mg-muted">
              Le copilote IA qui dit aux livreurs indépendants si une course est
              vraiment rentable.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-mg-foreground">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-mg-muted transition-colors hover:text-mg-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-mg-border pt-6 sm:flex-row">
          <p className="text-xs text-mg-faint">
            © {new Date().getFullYear()} Uberly. Tous droits réservés.
          </p>
          <p className="text-xs text-mg-faint">
            Fait avec soin pour les livreurs indépendants.
          </p>
        </div>
      </div>
    </footer>
  );
}
