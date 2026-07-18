import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { margeoRoutes } from "@/lib/margeo/routes";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Commencer gratuitement", href: margeoRoutes.signup },
      { label: "Se connecter", href: margeoRoutes.login },
      { label: "Premium", href: margeoRoutes.premium },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Plateformes",
    links: [
      { label: "Uber Eats", href: margeoRoutes.signup },
      { label: "Deliveroo", href: margeoRoutes.signup },
      { label: "Stuart", href: margeoRoutes.signup },
      { label: "Amazon Flex", href: margeoRoutes.signup },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Résultats beta", href: "#resultats" },
      { label: "Le problème", href: "#probleme" },
      { label: "FAQ", href: "#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-mg-border pb-24 lg:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mg-muted">
              Le gain net, avant d&apos;accepter. Pour les livreurs Uber Eats,
              Deliveroo et Stuart.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["Uber Eats", "Deliveroo", "Stuart"] as const).map((p) => (
                <PlatformLogo key={p} platform={p} size="xs" />
              ))}
            </div>
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
            Conçu pour les livreurs indépendants.
          </p>
        </div>
      </div>
    </footer>
  );
}
