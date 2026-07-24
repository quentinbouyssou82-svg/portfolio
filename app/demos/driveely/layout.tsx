import { PRODUCT_DESCRIPTION, PRODUCT_NAME } from "@/lib/margeo/brand";
import { getAppMode } from "@/lib/margeo/config";
import { DriveelyPostHogProvider } from "@/components/margeo/analytics/posthog-provider";
import { DriveelyThemeProvider } from "@/components/margeo/theme-provider";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./driveely.css";

const geistSans = Geist({
  variable: "--font-driveely-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-driveely-mono",
  subsets: ["latin"],
});

const appMode = getAppMode();
const modeSuffix = appMode === "beta" ? " · Bêta" : "";

export const metadata: Metadata = {
  title: {
    default: `${PRODUCT_NAME}${modeSuffix} — Gain net avant d'accepter`,
    template: `%s · ${PRODUCT_NAME}${modeSuffix}`,
  },
  description: PRODUCT_DESCRIPTION,
  icons: {
    icon: "/driveely/favicon.png",
    apple: "/driveely/icon.png",
  },
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: `${PRODUCT_NAME}${modeSuffix}`,
  },
  other: {
    "driveely-app-mode": appMode,
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

export default function DriveelyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} driveely-root`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <Script
        id="driveely-theme-boot"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var p=location.pathname;var base="/demos/driveely";var marketing=p===base||p===base+"/"||p.indexOf(base+"/login")===0||p.indexOf(base+"/signup")===0||p.indexOf(base+"/forgot-password")===0;if(marketing){document.documentElement.style.colorScheme="dark";return;}var t=localStorage.getItem("driveely-theme");if(t==="light"||t==="dark"){var r=document.getElementById("driveely-theme-boot");var root=r&&r.parentElement;if(root&&root.classList.contains("driveely-root"))root.setAttribute("data-theme",t);document.documentElement.style.colorScheme=t;}}catch(e){}})();`,
        }}
      />
      <DriveelyThemeProvider>
        <DriveelyPostHogProvider>
          {children}
        </DriveelyPostHogProvider>
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
            className: "driveely-toast",
            style: {
              background: "var(--color-mg-card)",
              border: "1px solid var(--color-mg-border-strong)",
              color: "var(--color-mg-foreground)",
              borderRadius: "1rem",
              boxShadow: "var(--shadow-mg-card)",
            },
          }}
        />
      </DriveelyThemeProvider>
    </div>
  );
}
