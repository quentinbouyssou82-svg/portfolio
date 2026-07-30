import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { PlatformLogo } from "@/components/margeo/platform-logo";
import { LegalFooterLinks } from "@/components/margeo/legal-footer-links";
import { DRIVEELY_CONTACT_EMAIL } from "@/lib/margeo/brand";
import { getAppFeatures } from "@/lib/margeo/config";
import { margeoRoutes } from "@/lib/margeo/routes";

export function Footer() {
  const premiumFooterLabel =
    getAppFeatures().premiumPageMode === "beta_unlocked"
      ? "Fonctionnalités"
      : "Offres";

  const columns = [
    {
      title: "Produit",
      links: [
        { label: "Rejoindre la bêta", href: margeoRoutes.signup + "&beta=1" },
        { label: "Se connecter", href: margeoRoutes.login },
        { label: premiumFooterLabel, href: margeoRoutes.premium },
        { label: "Retour", href: margeoRoutes.retour },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Ressources",
      links: [
        { label: "Comment ça marche", href: "#fonctionnalites" },
        { label: "Le problème", href: "#probleme" },
        { label: "FAQ — plateformes", href: "#faq" },
        {
          label: "Contact",
          href: `mailto:${DRIVEELY_CONTACT_EMAIL}`,
        },
      ],
    },
  ];

  return (
    <footer className="relative z-[1] border-t border-mg-border pb-24 lg:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(2,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-mg-muted">
              Aide à la décision pour livreurs indépendants : analyse de
              captures de propositions de course (estimation, pas une
              garantie).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["Uber Eats", "Deliveroo", "Stuart"] as const).map((p) => (
                <PlatformLogo key={p} platform={p} size="xs" showLabel />
              ))}
            </div>
            <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-mg-faint">
              Uber Eats, Deliveroo, Stuart, Amazon Flex et autres marques citées
              appartiennent à leurs titulaires. Driveely n&apos;est pas affilié,
              partenaire ni approuvé par ces sociétés.
            </p>
          </div>

          {columns.map((column) => (
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

        <div className="mt-12 space-y-4 border-t border-mg-border pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-mg-faint">
              Informations légales
            </p>
            <div className="mt-3">
              <LegalFooterLinks />
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-xs text-mg-faint">
              © {new Date().getFullYear()} Driveely. Tous droits réservés.
            </p>
            <p className="text-xs text-mg-faint">
              Bêta : pas de prélèvement. Paiement Stripe prévu à la
              commercialisation (renouvellement auto).
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
