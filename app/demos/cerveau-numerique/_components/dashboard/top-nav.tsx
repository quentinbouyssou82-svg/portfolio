"use client";

import {
  Brain,
  Home,
  Mail,
  CheckSquare,
  Calendar,
  FileText,
  Search,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../_lib/cn";
import type { ViewId } from "../../_lib/dashboard-data";

const tabs: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Accueil", icon: Home },
  { id: "mails", label: "Mails", icon: Mail },
  { id: "tasks", label: "Tâches", icon: CheckSquare },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
];

const iconTabs: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "search", label: "Recherche", icon: Search },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "suggestions", label: "Suggestions", icon: TrendingUp },
];

export function TopNav({
  active,
  onNavigate,
}: {
  active: ViewId;
  onNavigate: (view: ViewId) => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-[var(--cn-border)] bg-[var(--cn-surface)] px-3 backdrop-blur-xl">
      <button
        onClick={() => onNavigate("home")}
        className="mr-1 flex size-9 items-center justify-center rounded-xl border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]"
        aria-label="Accueil"
      >
        <Brain className="size-5" />
      </button>

      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]"
                  : "text-[var(--cn-muted)] hover:bg-white/[0.05] hover:text-[var(--cn-fg)]",
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        {iconTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              aria-label={tab.label}
              className={cn(
                "flex size-9 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]"
                  : "text-[var(--cn-muted)] hover:bg-white/[0.05] hover:text-[var(--cn-fg)]",
              )}
            >
              <Icon className="size-[18px]" />
            </button>
          );
        })}

        <button className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-[#ef4444]/40 bg-[#ef4444]/10 px-3 py-1.5 text-xs font-medium text-[#f87171] transition-colors hover:bg-[#ef4444]/15">
          <RefreshCw className="size-3.5" />
          <span className="hidden md:inline">Reconnecter Gmail</span>
        </button>

        <button
          onClick={() => onNavigate("settings")}
          aria-label="Paramètres"
          className={cn(
            "flex size-9 items-center justify-center rounded-full border transition-colors",
            active === "settings"
              ? "border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]"
              : "border-[var(--cn-border)] text-[var(--cn-muted)] hover:text-[var(--cn-fg)]",
          )}
        >
          <Settings className="size-[18px]" />
        </button>
      </div>
    </header>
  );
}
