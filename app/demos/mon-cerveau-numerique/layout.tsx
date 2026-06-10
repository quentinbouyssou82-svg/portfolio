import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./mcn.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-mcn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mon Cerveau Numérique",
  description:
    "Ton assistant de vie intelligent — GED, tâches proactives et veille personnalisée.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function McnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} mcn-root`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
