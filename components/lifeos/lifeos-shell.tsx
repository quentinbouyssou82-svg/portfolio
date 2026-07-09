"use client";

import { LifeOSBottomNav } from "./lifeos-bottom-nav";
import { LifeOSCelebration } from "./lifeos-celebration";
import { LifeOSCoachPanel } from "./lifeos-coach-panel";
import { LifeOSSidebar } from "./lifeos-sidebar";

export function LifeOSShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="lifeos-desktop-shell">
        <LifeOSSidebar />
        <div className="lifeos-main min-h-dvh">{children}</div>
        <aside className="hidden border-l border-[var(--lifeos-border)] bg-white p-5 lg:block">
          <LifeOSCoachPanel />
        </aside>
      </div>
      <LifeOSBottomNav />
      <LifeOSCelebration />
    </>
  );
}
