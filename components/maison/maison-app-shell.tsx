import type { ReactNode } from "react";
import { MaisonBottomNav } from "@/components/maison/maison-bottom-nav";

export function MaisonAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-md min-h-screen pb-28">{children}</div>
      <MaisonBottomNav />
    </div>
  );
}

export function MaisonPageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="px-6 pt-10 pb-6 animate-rise">
      {eyebrow ? (
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sage mb-2">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-serif text-4xl leading-[1.05] text-balance">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-sm text-muted-foreground max-w-[34ch] text-pretty">{subtitle}</p>
      ) : null}
    </header>
  );
}
