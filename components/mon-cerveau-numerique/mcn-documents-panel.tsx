"use client";

import { FileText, FolderOpen, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { McnPageSkeleton } from "@/components/mon-cerveau-numerique/mcn-page-skeleton";
import { McnButton } from "@/components/mon-cerveau-numerique/ui/button";
import { McnCard } from "@/components/mon-cerveau-numerique/ui/card";
import { McnEmptyState } from "@/components/mon-cerveau-numerique/ui/empty-state";
import { McnInput } from "@/components/mon-cerveau-numerique/ui/input";
import { McnLabel } from "@/components/mon-cerveau-numerique/ui/label";
import { useMcnStore } from "@/hooks/use-mcn-store";
import { documentCategories } from "@/lib/mon-cerveau-numerique/content";

export function McnDocumentsPanel() {
  const { data, ready, addDocument, deleteDocument } = useMcnStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(documentCategories[0]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addDocument(name, category);
    setName("");
  }

  if (!ready) {
    return <McnPageSkeleton variant="list" />;
  }

  return (
    <div className="space-y-4">
      <McnCard>
        <form onSubmit={handleAdd} className="space-y-3 p-4">
          <div className="space-y-2">
            <McnLabel htmlFor="mcn-doc-name">Nom du document</McnLabel>
            <McnInput
              id="mcn-doc-name"
              placeholder="Facture EDF — Mars 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <McnLabel htmlFor="mcn-doc-category">Catégorie</McnLabel>
              <select
                id="mcn-doc-category"
                className="flex h-9 w-full rounded-lg border border-[var(--mcn-border)] bg-[var(--mcn-surface)] px-3 text-sm text-[var(--mcn-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mcn-ring)]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {documentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <McnButton type="submit" disabled={!name.trim()} aria-label="Ajouter le document">
                <Plus className="size-4" />
              </McnButton>
            </div>
          </div>
        </form>
      </McnCard>

      {data.documents.length === 0 ? (
        <McnEmptyState
          icon={FolderOpen}
          title="Aucun document"
          description="Ajoute ton premier document pour alimenter ta GED intelligente."
        />
      ) : (
        <ul className="space-y-2">
          {data.documents.map((doc) => (
            <li key={doc.id}>
              <McnCard className="transition-colors hover:border-[var(--mcn-border-strong)] hover:bg-[var(--mcn-surface-hover)]">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--mcn-border)] bg-[var(--mcn-bg)]">
                    <FileText className="size-4 text-[var(--mcn-accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-[11px] text-[var(--mcn-fg-subtle)]">
                      {doc.category} · {formatDate(doc.created_at)}
                    </p>
                  </div>
                  <McnButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-[var(--mcn-fg-subtle)] hover:text-red-400"
                    onClick={() => deleteDocument(doc.id)}
                    aria-label="Supprimer le document"
                  >
                    <Trash2 className="size-3.5" />
                  </McnButton>
                </div>
              </McnCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
