import type { Metadata } from "next";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import { ResponsivePreviewShell } from "@/components/responsive-preview-shell";
import "./premium-motion.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nocta Agency - Agence Web Premium",
  description:
    "Nocta Agency crée des sites web modernes, performants et haut de gamme pour restaurants, freelances et PME.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      data-theme="dark"
      suppressHydrationWarning
      className={`h-full antialiased ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ResponsivePreviewShell>{children}</ResponsivePreviewShell>
      </body>
    </html>
  );
}
