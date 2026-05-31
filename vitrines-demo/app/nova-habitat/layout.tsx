import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./nova-habitat.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nova-sans",
});

export const metadata: Metadata = {
  title: "Nova Habitat · Rénovation haut de gamme",
  description:
    "Entreprise de rénovation à Paris et en Île-de-France. Devis gratuit, travaux clés en main.",
};

export default function NovaHabitatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${dmSans.variable} nova-habitat-root`}>{children}</div>
  );
}
