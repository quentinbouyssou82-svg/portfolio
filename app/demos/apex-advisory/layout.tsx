import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { ApexLocaleProvider } from "@/components/apex-advisory/apex-locale-provider";
import { fr } from "@/lib/apex-advisory/i18n/fr";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-apex-display",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-apex-sans",
});

export const metadata: Metadata = {
  title: fr.meta.title,
  description: fr.meta.description,
  robots: { index: false, follow: false },
};

export default function ApexAdvisoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApexLocaleProvider>
      <div
        className={`${display.variable} ${sans.variable} apex-root notranslate min-h-screen w-full`}
        style={{ color: "#f5f2ec" }}
        translate="no"
      >
        {children}
      </div>
    </ApexLocaleProvider>
  );
}
