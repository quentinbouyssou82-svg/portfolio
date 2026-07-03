"use client";

import { FileText, Search, Settings2, Upload, Plus } from "lucide-react";
import { EmptyState, ImportGmailBanner, ViewContainer } from "../shared";

export function DocumentsView() {
  return (
    <ViewContainer wide>
      <div className="mb-5">
        <ImportGmailBanner />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] px-3 py-1.5 text-sm font-medium text-[var(--cn-primary)]">
          <FileText className="size-4" />
          Tous
          <span className="rounded-full bg-white/10 px-1.5 text-xs">0</span>
        </button>
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--cn-faint)]" />
          <input
            placeholder="Rechercher..."
            className="w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-surface)] py-2 pl-9 pr-3 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] focus:border-[var(--cn-primary-border)]"
          />
        </div>
        <button
          aria-label="Gérer les dossiers"
          className="flex size-9 items-center justify-center rounded-lg border border-[var(--cn-border)] text-[var(--cn-muted)] transition-colors hover:text-[var(--cn-fg)]"
        >
          <Settings2 className="size-4" />
        </button>
        <button className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[image:var(--cn-grad-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5">
          <Plus className="size-4" />
          Ajouter document
        </button>
      </div>

      <EmptyState
        icon={FileText}
        description="Aucun document encore — commence par uploader une facture ou un contrat"
        action={
          <button className="inline-flex items-center gap-2 rounded-full bg-[image:var(--cn-grad-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5">
            <Upload className="size-4" />
            Uploader mon premier document
          </button>
        }
      />
    </ViewContainer>
  );
}
