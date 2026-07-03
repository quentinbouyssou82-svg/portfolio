"use client";

import { Sparkles, X, ArrowRight, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "../../_lib/cn";

/** Centered empty-state block used across dashboard views. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "cn-card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center",
        className,
      )}
    >
      <Icon className="size-9 text-[var(--cn-faint)]" strokeWidth={1.5} />
      {title && <p className="text-base font-medium text-[var(--cn-fg)]">{title}</p>}
      {description && (
        <p className="max-w-md text-sm text-[var(--cn-faint)]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Dismissible "Importe ton organisation Gmail" promo banner. */
export function ImportGmailBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="relative flex flex-col gap-3 overflow-hidden rounded-[var(--cn-radius)] border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] p-4 sm:flex-row sm:items-center sm:gap-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--cn-primary)]/20 text-[var(--cn-primary)]">
        <Sparkles className="size-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">Importe ton organisation Gmail</p>
        <p className="mt-0.5 text-xs text-[var(--cn-muted)]">
          Je scanne tes libellés Gmail existants et crée les mêmes dossiers dans
          l&apos;app — tu gardes ta logique, je m&apos;adapte.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--cn-primary)]/40 px-3 py-1.5 text-xs font-medium text-white/70"
        >
          Importer mon organisation
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg border border-[var(--cn-border)] px-3 py-1.5 text-xs font-medium text-[var(--cn-muted)] transition-colors hover:text-[var(--cn-fg)]"
        >
          Plus tard
        </button>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
        className="absolute right-3 top-3 text-[var(--cn-faint)] transition-colors hover:text-[var(--cn-fg)] sm:static"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/** Standard content wrapper: centered column with max width + padding. */
export function ViewContainer({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6",
        wide ? "max-w-6xl" : "max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Primary pill button reused inside dashboard empty states. */
export function PillButton({
  children,
  icon: Icon = ArrowRight,
  onClick,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[image:var(--cn-grad-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5"
    >
      {children}
      <Icon className="size-4" />
    </button>
  );
}
