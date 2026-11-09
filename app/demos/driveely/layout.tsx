import { PRODUCT_DESCRIPTION } from "@/lib/margeo/brand";
import { getAppMode } from "@/lib/margeo/config";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./driveely.css";

const geistSans = Geist({
  variable: "--font-driveely-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-driveely-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const appMode = getAppMode();
const modeSuffix = appMode === "beta" ? " · Bêta" : "";

export const metadata: Metadata = {
  ...buildDriveelyMetadata({
    description: PRODUCT_DESCRIPTION,
    path: "/",
    modeSuffix,
  }),
  other: {
    "driveely-app-mode": appMode,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
    { media: "(prefers-color-scheme: light)", color: "#09090B" },
  ],
};

export default function DriveelyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} driveely-root`}
      data-theme="dark"
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}
