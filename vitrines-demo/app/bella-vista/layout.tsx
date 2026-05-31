import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./bella-vista.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bella-display",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-bella-sans",
});

export const metadata: Metadata = {
  title: "Bella Vista · Restaurant gastronomique",
  description: "Expérience culinaire italienne premium.",
};

export default function BellaVistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${display.variable} ${sans.variable} bella-vista-root`}>
      {children}
    </div>
  );
}
