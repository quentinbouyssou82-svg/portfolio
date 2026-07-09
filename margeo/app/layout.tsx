import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Margeo — Sache si ta course vaut le coup",
    template: "%s · Margeo",
  },
  description:
    "Margeo est le copilote IA des livreurs indépendants. Capture la proposition de course, dépose-la, et sache en 2 secondes si elle est vraiment rentable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-card)",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
