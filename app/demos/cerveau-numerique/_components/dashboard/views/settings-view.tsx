"use client";

import { useState } from "react";
import {
  AtSign,
  Mail,
  FileText,
  Bell,
  Search,
  MessageSquare,
  Tag,
  Save,
  Download,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../../_lib/cn";
import {
  SETTINGS_MAIL_TABS,
  MAIL_CATEGORIES_SOCLE,
  MAIL_PACK_PARTICULIER,
  MAIL_PACK_PRO,
  type MailCategory,
} from "../../../_lib/dashboard-data";

const navIcons: Record<string, LucideIcon> = {
  comptes: AtSign,
  mails: Mail,
  documents: FileText,
  notifications: Bell,
  recherche: Search,
  chat: MessageSquare,
};

const nav = [
  { id: "comptes", label: "Comptes" },
  { id: "mails", label: "Mails" },
  { id: "documents", label: "Documents" },
  { id: "notifications", label: "Notifications" },
  { id: "recherche", label: "Recherche" },
  { id: "chat", label: "Chat IA" },
];

export function SettingsView() {
  const [section, setSection] = useState("mails");
  const [mailTab, setMailTab] = useState(SETTINGS_MAIL_TABS[0]);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      {/* Settings sidebar */}
      <aside className="w-full shrink-0 border-b border-[var(--cn-border)] p-4 md:w-60 md:border-b-0 md:border-r">
        <h2 className="mb-4 inline-flex items-center gap-2 px-1 text-sm font-semibold">
          <span className="text-[var(--cn-primary)]">⚙</span> Paramètres
        </h2>
        <nav className="space-y-1">
          {nav.map((n) => {
            const Icon = navIcons[n.id];
            const active = section === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setSection(n.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]"
                    : "text-[var(--cn-muted)] hover:bg-white/[0.04] hover:text-[var(--cn-fg)]",
                )}
              >
                <Icon className="size-4" />
                {n.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 p-4 sm:p-6">
        {section === "mails" ? (
          <MailSettings mailTab={mailTab} onTab={setMailTab} />
        ) : (
          <PlaceholderSection label={nav.find((n) => n.id === section)?.label ?? ""} />
        )}
      </div>
    </div>
  );
}

function MailSettings({
  mailTab,
  onTab,
}: {
  mailTab: string;
  onTab: (t: string) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--cn-border)] bg-[var(--cn-surface)] p-1.5">
        {SETTINGS_MAIL_TABS.map((t) => (
          <button
            key={t}
            onClick={() => onTab(t)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              mailTab === t
                ? "bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]"
                : "text-[var(--cn-muted)] hover:text-[var(--cn-fg)]",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {mailTab === "Catégories et vues" ? (
        <div className="mt-6">
          <h3 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
            <Tag className="size-4 text-[var(--cn-primary)]" />
            Catégories et vues
          </h3>
          <p className="mt-1 text-sm text-[var(--cn-muted)]">
            14 catégories actives dans la sidebar Gmail.
          </p>

          <CategoryGroup
            title="Socle commun (toujours actif)"
            emoji="🧱"
            badge="8 catégories"
            items={MAIL_CATEGORIES_SOCLE}
          />
          <CategoryGroup
            title="Pack Particulier"
            emoji="🧑"
            badge="0 / 5 actives"
            action="Tout activer"
            items={MAIL_PACK_PARTICULIER}
          />
          <CategoryGroup
            title="Pack Pro"
            emoji="💼"
            badge="6 / 10 actives"
            action="Tout activer"
            items={MAIL_PACK_PRO}
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--cn-border)] px-4 py-2 text-sm font-medium text-[var(--cn-muted)] transition-colors hover:text-[var(--cn-fg)]">
              <Download className="size-4" />
              Importer depuis Gmail
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[image:var(--cn-grad-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5">
              <Save className="size-4" />
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <PlaceholderSection label={mailTab} />
      )}
    </div>
  );
}

function CategoryGroup({
  title,
  emoji,
  badge,
  action,
  items,
}: {
  title: string;
  emoji: string;
  badge: string;
  action?: string;
  items: MailCategory[];
}) {
  return (
    <div className="mt-6 rounded-[var(--cn-radius)] border border-[var(--cn-border)] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <span>{emoji}</span>
          {title}
        </p>
        <div className="flex items-center gap-2">
          {action && (
            <button className="rounded-full bg-[var(--cn-primary-tint)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--cn-primary)]">
              {action}
            </button>
          )}
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-[var(--cn-faint)]">
            {badge}
          </span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ cat }: { cat: MailCategory }) {
  const [checked, setChecked] = useState(cat.active);
  return (
    <button
      onClick={() => !cat.socle && setChecked((c) => !c)}
      className={cn(
        "flex gap-3 rounded-xl border p-3 text-left transition-colors",
        checked
          ? "border-[var(--cn-border)] bg-[var(--cn-surface)]"
          : "border-[var(--cn-border-soft)] bg-transparent opacity-70 hover:opacity-100",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border text-[10px]",
          checked
            ? "border-[var(--cn-primary)] bg-[var(--cn-primary)] text-white"
            : "border-[var(--cn-border)]",
        )}
      >
        {checked && "✓"}
      </span>
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <span>{cat.emoji}</span>
          {cat.label}
          {cat.socle && (
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-[var(--cn-faint)]">
              Socle
            </span>
          )}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--cn-faint)]">
          {cat.description}
        </p>
      </div>
    </button>
  );
}

function PlaceholderSection({ label }: { label: string }) {
  return (
    <div className="cn-card mt-6 flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
      <p className="text-base font-medium">{label}</p>
      <p className="max-w-sm text-sm text-[var(--cn-faint)]">
        Section de paramètres « {label} » — réglages disponibles une fois tes
        comptes et intégrations connectés.
      </p>
    </div>
  );
}
