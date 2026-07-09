import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-palan-display",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-palan-sans",
});

export const metadata: Metadata = {
  title: "Palan Capital — Ingénierie financière & structuration patrimoniale",
  description:
    "Cabinet indépendant d'ingénierie financière. Financement & LLD, dette privée, fiducie-sûreté, structuration patrimoniale, levée de fonds. France · Luxembourg · Émirats Arabes Unis.",
  robots: { index: false, follow: false },
};

export default function PalanCapitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${display.variable} ${sans.variable} palan-root min-h-screen w-full`}
      style={{ backgroundColor: "#030304", color: "#f5f2ec" }}
    >
      {children}
    </div>
  );
}
