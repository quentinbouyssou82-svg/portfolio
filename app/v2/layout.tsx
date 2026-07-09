import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter_Tight } from "next/font/google";
import "../premium-motion.css";
import "./v2-tokens.css";
import "./v2-motion.css";
import "./v2-pricing.css";
import "./v2.css";

const v2Sans = Inter_Tight({
  variable: "--font-v2-sans",
  subsets: ["latin"],
  display: "swap",
});

const v2Mono = IBM_Plex_Mono({
  variable: "--font-v2-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nocta Agency — Portfolio V2",
  description:
    "Nocta Agency crée des sites web modernes, performants et haut de gamme pour restaurants, freelances et PME.",
};

export default function V2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${v2Sans.variable} ${v2Mono.variable} v2-root`}>
      {children}
    </div>
  );
}
