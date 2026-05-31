import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Démonstrations · Nocta Agency",
  description: "Projets conceptuels Nocta Agency — démos web premium.",
};

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return <div className="demo-routes-root min-h-screen">{children}</div>;
}
