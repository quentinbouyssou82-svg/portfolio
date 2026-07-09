import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./maison.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-maison-serif",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-maison-sans",
});

export const metadata: Metadata = {
  title: "Maison — Assistant alimentaire familial",
  description:
    "Une intelligence douce pour organiser les repas, équilibrer le budget et apaiser le quotidien de votre famille.",
  robots: { index: false, follow: false },
};

export default function MaisonLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${serif.variable} ${sans.variable} maison-root`}>{children}</div>
  );
}
