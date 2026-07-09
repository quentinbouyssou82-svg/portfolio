import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./meridian-capital.css";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-meridian-display",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-meridian-sans",
});

export const metadata: Metadata = {
  title: "Meridian Capital · Ingénierie financière",
  description:
    "Cabinet d'ingénierie financière haut de gamme. Structuration, optimisation fiscale, modélisation de risques et conseil patrimonial.",
  robots: { index: false, follow: false },
};

export default function MeridianCapitalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${sans.variable} meridian-root min-h-screen`}>
      {children}
    </div>
  );
}
