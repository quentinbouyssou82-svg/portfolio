"use client";

import { Check, Folder } from "lucide-react";
import { cn } from "../../../_lib/cn";

export function FolderChecklist({
  folders,
  checked,
  onToggle,
}: {
  folders: string[];
  checked: string[];
  onToggle: (folder: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {folders.map((folder) => {
        const isChecked = checked.includes(folder);
        return (
          <button
            key={folder}
            type="button"
            onClick={() => onToggle(folder)}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--cn-radius-sm)] border px-4 py-3 text-left text-sm transition-all duration-200",
              isChecked
                ? "border-[var(--cn-primary)] bg-[var(--cn-primary-tint)]"
                : "border-[var(--cn-border)] bg-[var(--cn-surface)] opacity-60 hover:opacity-100",
            )}
          >
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                isChecked
                  ? "border-[var(--cn-primary)] bg-[var(--cn-primary)] text-white"
                  : "border-[var(--cn-border)]",
              )}
            >
              {isChecked && <Check className="size-3.5" />}
            </span>
            <Folder className="size-4 text-[var(--cn-muted)]" />
            <span className="font-medium text-[var(--cn-fg)]">{folder}</span>
          </button>
        );
      })}
    </div>
  );
}
