import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./lead-finder.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-lead-finder-sans",
});

export const metadata: Metadata = {
  title: "Lead Finder",
  description: "Démonstration Lead Finder.",
};

export default function LeadFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${sans.variable} lead-finder-root`}>{children}</div>
  );
}
