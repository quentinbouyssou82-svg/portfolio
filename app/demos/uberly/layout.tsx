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
    default: `${PRODUCT_NAME} — Gain net avant d'accepter`,
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
        offset={{ bottom: "1.25rem", right: "1.25rem" }}
        mobileOffset={{
          bottom: "calc(5.75rem + env(safe-area-inset-bottom))",
          right: "0.75rem",
          left: "0.75rem",
        }}
        toastOptions={{
          className: "uberly-toast",
          style: {
            background: "var(--color-mg-card)",
            border: "1px solid var(--color-mg-border-strong)",
            color: "var(--color-mg-foreground)",
            borderRadius: "1rem",
            boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.35)",
          },
        }}
      />
    </div>
  );
}
