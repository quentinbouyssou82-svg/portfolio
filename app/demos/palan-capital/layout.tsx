import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { PalanCookieBanner } from "@/components/palan-capital/palan-cookie-banner";
import { PalanFooter } from "@/components/palan-capital/palan-footer";
import { PalanNav } from "@/components/palan-capital/palan-nav";
import { CONTACT_EMAIL } from "@/lib/palan-capital/constants";
import "./palan-capital.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-palan-display",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-palan-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Palan Capital — Ingénierie financière & structuration patrimoniale",
    template: "%s · Palan Capital",
  },
  description:
    "Cabinet indépendant d'ingénierie financière. Financement & LLD, dette privée, fiducie-sûreté, structuration patrimoniale, levée de fonds. France · Luxembourg · Émirats Arabes Unis.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Palan Capital",
    description:
      "Cabinet indépendant d'ingénierie financière et de structuration patrimoniale.",
    type: "website",
    locale: "fr_FR",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "Palan Capital",
  legalName: "SAS LIVING",
  url: "https://palan-capital.netlify.app",
  email: CONTACT_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "2 rue d'Austerlitz",
    addressLocality: "Toulouse",
    postalCode: "31000",
    addressCountry: "FR",
  },
  areaServed: ["France", "Luxembourg", "Émirats Arabes Unis"],
  description:
    "Cabinet indépendant d'ingénierie financière et de structuration patrimoniale.",
};

export default function PalanCapitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${sans.variable} palan-root min-h-screen`}>
      <a href="#main-content" className="palan-skip-link">
        Aller au contenu
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <PalanNav />
      <main id="main-content">{children}</main>
      <PalanFooter />
      <PalanCookieBanner />
    </div>
  );
}
