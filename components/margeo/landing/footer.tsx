import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { margeoRoutes } from "@/lib/margeo/routes";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Rejoindre la beta", href: margeoRoutes.signup },
      { label: "Se connecter", href: margeoRoutes.login },
      { label: "Premium", href: margeoRoutes.premium },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Plateformes",
    links: [
      { label: "Uber Eats", href: "#demo" },
      { label: "Deliveroo", href: "#demo" },
      { label: "Stuart", href: "#demo" },
      { label: "Amazon Flex", href: "#demo" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Démo interactive", href: "#demo" },
      { label: "Résultats beta", href: "#resultats" },
      { label: "Le problème", href: "#probleme" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-mg-border bg-mg-surface/60 pb-24 lg:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mg-muted">
              Le copilote IA qui dit aux livreurs indépendants si une course est
              vraiment rentable — avant qu&apos;il soit trop tard.
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
            Fait pour les livreurs indépendants.
          </p>
        </div>
      </div>
    </footer>
  );
}
