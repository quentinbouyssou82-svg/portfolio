import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Fraunces } from "next/font/google";
import "./cerveau-numerique.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cn-sans",
});

const heading = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cn-heading",
});

// Stand-in for STK Bureau Serif (a paid commercial typeface from Smuss Type
// Kiosk with no free/webfont distribution) — Fraunces is the closest
// freely-licensable match: a constructed, premium display serif.
const heroSerif = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal"],
  variable: "--font-cn-hero-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cn-mono",
});

export const metadata: Metadata = {
  title: "Mon Cerveau Numérique — Ton assistant de vie personnel",
  description:
    "GED intelligente, to-do proactive, veille personnalisée et gestion de ta vie perso & pro — tout centralisé, tout automatisé.",
  robots: { index: false, follow: false },
};

export default function CerveauNumeriqueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${sans.variable} ${heading.variable} ${heroSerif.variable} ${mono.variable} cn-root`}
    >
      {children}
    </div>
  );
}
