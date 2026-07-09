import { PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/lib/margeo/brand";
import { UberlyPostHogProvider } from "@/components/margeo/analytics/posthog-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./uberly.css";

const geistSans = Geist({
  variable: "--font-uberly-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-uberly-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT_NAME} — Sache si ta course vaut le coup`,
    template: `%s · ${PRODUCT_NAME}`,
  },
  description: PRODUCT_DESCRIPTION,
  icons: {
    icon: "/uberly/favicon.png",
    apple: "/uberly/icon.png",
  },
  robots: { index: false, follow: false },
};

export default function UberlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} uberly-root`}
    >
      <UberlyPostHogProvider>
        {children}
      </UberlyPostHogProvider>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-mg-card)",
            border: "1px solid var(--color-mg-border-strong)",
            color: "var(--color-mg-foreground)",
          },
        }}
      />
    </div>
  );
}
