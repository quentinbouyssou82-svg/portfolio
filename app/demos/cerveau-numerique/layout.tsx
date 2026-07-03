import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./cerveau-numerique.css";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-cn-sans",
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
    <div className={`${sans.variable} ${mono.variable} cn-root`}>{children}</div>
  );
}
