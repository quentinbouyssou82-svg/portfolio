import { PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/lib/margeo/brand";
import { UberlyPostHogProvider } from "@/components/margeo/analytics/posthog-provider";
import { UberlyThemeProvider } from "@/components/margeo/theme-provider";
import type { Metadata, Viewport } from "next";
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: PRODUCT_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#f4f4f5" },
  ],
};

export default function UberlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} uberly-root`}
      data-theme="dark"
    >
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("uberly-theme");if(t==="light"||t==="dark"){var r=document.currentScript&&document.currentScript.parentElement;if(r)r.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}}catch(e){}})();`,
        }}
      />
      <UberlyThemeProvider>
        <UberlyPostHogProvider>
          {children}
        </UberlyPostHogProvider>
        <Toaster
          theme="system"
          position="bottom-right"
          offset={{ bottom: "1.25rem", right: "1.25rem" }}
          mobileOffset={{
            bottom: "calc(5.75rem + env(safe-area-inset-bottom, 0px))",
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
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px rgba(0,0,0,0.2)",
            },
          }}
        />
      </UberlyThemeProvider>
    </div>
  );
}
