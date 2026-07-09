"use client";

import { useEffect, useState } from "react";
import { V2About } from "@/components/v2/v2-about";
import { V2Background } from "@/components/v2/v2-background";
import { V2Contact } from "@/components/v2/v2-contact";
import { V2Header } from "@/components/v2/v2-header";
import { V2Hero } from "@/components/v2/v2-hero";
import { V2Pricing } from "@/components/v2/v2-pricing";
import { V2Projects } from "@/components/v2/v2-projects";
import { V2Services } from "@/components/v2/v2-services";
import { isPreviewFrame } from "@/hooks/use-responsive-preview";

export default function PortfolioV2Page() {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nocta-theme");
    if (stored === "dark" || stored === "light") setTheme(stored);
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nocta-theme", theme);
  }, [theme, themeReady]);

  useEffect(() => {
    if (!isPreviewFrame()) return;
    document.body.setAttribute("data-preview-frame", "true");
    return () => document.body.removeAttribute("data-preview-frame");
  }, []);

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="portfolio-v2 relative min-h-screen overflow-x-hidden"
      data-theme={theme}
      suppressHydrationWarning
    >
      <V2Background />

      <V2Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onNavigate={scrollTo}
      />

      <main className="relative z-10">
        <V2Hero
          theme={theme}
          onContact={() => scrollTo("contact")}
          onProjects={() => scrollTo("projects")}
        />
        <V2Projects onContact={() => scrollTo("contact")} />
        <V2Services />
        <V2Pricing onContact={() => scrollTo("contact")} />
        <V2About />
        <V2Contact />
      </main>

      <footer className="relative z-10 v2-wrap border-t border-[var(--v2-border)] py-10">
        <p className="text-center text-xs text-[var(--v2-fg-tertiary)]">
          Nocta Agency · Lancement en préparation
        </p>
      </footer>
    </div>
  );
}
