import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { LifeOSProvider } from "@/lib/lifeos/provider";
import { LifeOSShell } from "@/components/lifeos/lifeos-shell";
import "./lifeos.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-lifeos-sans",
});

export const metadata: Metadata = {
  title: "LifeOS — Level up your life",
  description:
    "Personal life progression platform. Gamified habits, worlds, quests, and streaks.",
  robots: { index: false, follow: false },
};

export default function LifeOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <LifeOSProvider>
      <div className={`${sans.variable} lifeos-root`}>
        <LifeOSShell>{children}</LifeOSShell>
      </div>
    </LifeOSProvider>
  );
}
