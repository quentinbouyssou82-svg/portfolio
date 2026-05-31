import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./titan-fitness.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-titan-sans",
});

export const metadata: Metadata = {
  title: "Titan Fitness",
  description:
    "Salle de sport premium — programmes sur mesure, coachs certifiés et résultats mesurables.",
};

export default function TitanFitnessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} titan-fitness-root`}>{children}</div>
  );
}
