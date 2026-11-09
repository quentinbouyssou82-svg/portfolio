import Image from "next/image";
import Link from "next/link";
import {
  DRIVEELY_CONTACT_EMAIL,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
} from "@/lib/margeo/brand";
import { driveelyRoutes } from "@/lib/margeo/routes";

const PRIMARY_DOCS = [
  { href: driveelyRoutes.confidentialite, label: "Confidentialité" },
  { href: driveelyRoutes.cgu, label: "CGU" },
  { href: driveelyRoutes.cgv, label: "CGV" },
  { href: driveelyRoutes.mentionsLegales, label: "Mentions légales" },
  { href: driveelyRoutes.cookies, label: "Cookies" },
  { href: driveelyRoutes.contact, label: "Contact" },
] as const;

const SUPPORT_DOCS = [
  { href: driveelyRoutes.demandesRgpd, label: "Demandes RGPD" },
  { href: driveelyRoutes.suppressionDonnees, label: "Suppression des données" },
  { href: driveelyRoutes.remboursement, label: "Remboursement" },
  { href: driveelyRoutes.securiteDonnees, label: "Sécurité des données" },
] as const;

const OTHER_DOCS = [
  { href: driveelyRoutes.abonnementsStripe, label: "Abonnements" },
  {
    href: driveelyRoutes.proprieteIntellectuelle,
    label: "Propriété intellectuelle",
  },
  { href: driveelyRoutes.charteUtilisation, label: "Charte d’utilisation" },
  { href: driveelyRoutes.conditionsBeta, label: "Conditions bêta" },
] as const;

function DocLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex min-h-12 items-center justify-between gap-3 border-b border-white/[0.06] px-1 py-3 text-[15px] text-[#FAFAFA] transition-colors last:border-b-0 hover:text-[#818CF8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818CF8]"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className="text-[13px] text-[#8B8B94] transition-transform group-hover:translate-x-0.5 group-hover:text-[#818CF8]"
      >
        →
      </span>
    </Link>
  );
}

export function SiteHub() {
  return (
    <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))] sm:px-8 sm:pt-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[22rem] bg-[radial-gradient(ellipse_at_top,rgba(129,140,248,0.14)_0%,transparent_62%)]"
        aria-hidden
      />

      <header className="space-y-5">
        <div className="flex items-center gap-3">
          <Image
            src="/driveely/marketing/app-icon.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-[12px]"
            priority
          />
          <div>
            <h1 className="text-[1.75rem] font-semibold tracking-[-0.03em] text-[#FAFAFA] sm:text-[2rem]">
              {PRODUCT_NAME}
            </h1>
            <p className="text-[14px] text-[#A1A1AA]">{PRODUCT_TAGLINE}</p>
          </div>
        </div>
        <p className="max-w-md text-[15px] leading-relaxed text-[#A1A1AA]">
          Aide à la décision pour livreurs indépendants — contact et documents
          officiels.
        </p>
      </header>

      <section
        aria-labelledby="hub-contact"
        className="mt-10 rounded-2xl border border-white/[0.08] bg-[#121215] p-5 sm:p-6"
      >
        <p id="hub-contact" className="site-section-label">
          Contact officiel
        </p>
        <a
          href={`mailto:${DRIVEELY_CONTACT_EMAIL}`}
          className="mt-3 inline-flex min-h-11 items-center break-all text-[16px] font-medium text-[#FAFAFA] underline-offset-4 hover:text-[#818CF8] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818CF8]"
        >
          {DRIVEELY_CONTACT_EMAIL}
        </a>
        <p className="mt-2 text-[13px] leading-relaxed text-[#8B8B94]">
          Support, questions produit et demandes RGPD.
        </p>
        <Link
          href={driveelyRoutes.contact}
          className="mt-4 inline-flex min-h-11 items-center text-[14px] font-medium text-[#818CF8] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#818CF8]"
        >
          Page contact →
        </Link>
      </section>

      <section aria-labelledby="hub-docs" className="mt-10">
        <h2
          id="hub-docs"
          className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#818CF8]"
        >
          Documents importants
        </h2>
        <nav className="mt-3" aria-label="Documents importants">
          {PRIMARY_DOCS.map((doc) => (
            <DocLink key={doc.href} {...doc} />
          ))}
        </nav>
      </section>

      <section aria-labelledby="hub-support" className="mt-8">
        <h2
          id="hub-support"
          className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8B8B94]"
        >
          Support & données
        </h2>
        <nav className="mt-3" aria-label="Support et données">
          {SUPPORT_DOCS.map((doc) => (
            <DocLink key={doc.href} {...doc} />
          ))}
        </nav>
      </section>

      <section aria-labelledby="hub-other" className="mt-8">
        <h2
          id="hub-other"
          className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#8B8B94]"
        >
          Autres documents
        </h2>
        <nav className="mt-3" aria-label="Autres documents">
          {OTHER_DOCS.map((doc) => (
            <DocLink key={doc.href} {...doc} />
          ))}
        </nav>
      </section>
    </main>
  );
}
