import Link from "next/link";
import { Logo } from "@/components/margeo/logo";
import { LegalFooterLinks } from "@/components/margeo/legal-footer-links";
import { DRIVEELY_CONTACT_EMAIL, PRODUCT_NAME } from "@/lib/margeo/brand";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";

export const metadata: Metadata = buildDriveelyMetadata({
  title: "Contact",
  description:
    "Contacter Driveely pour le support, une question produit, une demande RGPD ou la suppression de compte.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] w-full max-w-2xl flex-col px-1 py-6 sm:py-10">
      <Link href={DRIVEELY_PATHS.home} className="inline-flex w-fit">
        <Logo />
      </Link>

      <main className="mt-12 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-mg-faint">
          {PRODUCT_NAME}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Contact</h1>
        <p className="mt-4 text-sm leading-relaxed text-mg-muted">
          Pour le support, une question produit, une demande RGPD (accès,
          rectification, portabilité, opposition) ou la suppression de compte,
          contactez le responsable de publication Driveely :
        </p>

        <ul className="mt-6 space-y-3 text-sm text-mg-muted">
          <li>
            <span className="font-medium text-mg-foreground">Responsable : </span>
            Quentin Bouyssou
          </li>
          <li>
            <span className="font-medium text-mg-foreground">E-mail : </span>
            <a
              href={`mailto:${DRIVEELY_CONTACT_EMAIL}`}
              className="font-medium text-mg-accent underline-offset-2 hover:underline"
            >
              {DRIVEELY_CONTACT_EMAIL}
            </a>
          </li>
          <li>
            <span className="font-medium text-mg-foreground">Confidentialité : </span>
            <Link
              href={DRIVEELY_PATHS.confidentialite}
              className="font-medium text-mg-accent underline-offset-2 hover:underline"
            >
              Politique de confidentialité
            </Link>
          </li>
        </ul>

        <p className="mt-8 text-sm leading-relaxed text-mg-muted">
          Indiquez l&apos;adresse e-mail associée à votre compte Driveely dans
          votre message. Les demandes relatives aux données personnelles sont
          traitées dans les délais prévus par le RGPD.
        </p>
      </main>

      <footer className="mt-16 border-t border-mg-border pt-6">
        <LegalFooterLinks />
        <Link
          href={DRIVEELY_PATHS.home}
          className="mt-4 inline-block text-sm text-mg-muted hover:text-mg-foreground"
        >
          ← Retour à l&apos;accueil
        </Link>
      </footer>
    </div>
  );
}
