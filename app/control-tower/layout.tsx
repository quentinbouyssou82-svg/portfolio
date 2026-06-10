import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./control-tower.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-control-tower",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Control Tower",
  description:
    "Tour de contrôle personnel — exécution, mémoire et progression.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#08090c",
};

export default function ControlTowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${sans.variable} control-tower-root`}>{children}</div>
  );
}
