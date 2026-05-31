"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileCode2, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CodeLine, ConceptProject } from "@/lib/concept-projects";
import { cn } from "@/lib/utils";

const tokenClasses: Record<CodeLine["tokens"][number]["type"], string> = {
  keyword: "text-[#c586c0]",
  string: "text-[#ce9178]",
  tag: "text-[#569cd6]",
  attr: "text-[#9cdcfe]",
  function: "text-[#dcdcaa]",
  comment: "text-[#6a9955]",
  plain: "text-[#d4d4d4]",
  number: "text-[#b5cea8]",
  type: "text-[#4ec9b0]",
};

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
};

function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide,
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Fermer la fenêtre"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface-strong)] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] sm:rounded-3xl",
              wide ? "max-w-5xl" : "max-w-2xl",
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
              <div>
                <h3 id="modal-title" className="text-xl font-semibold">
                  {title}
                </h3>
                {subtitle ? (
                  <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                aria-label="Fermer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

type CaseStudyModalProps = {
  project: ConceptProject | null;
  open: boolean;
  onClose: () => void;
};

export function CaseStudyModal({ project, open, onClose }: CaseStudyModalProps) {
  if (!project) return null;

  const sections = [
    { label: "Objectifs du projet", items: project.caseStudy.objectives },
    { label: "Réflexion UX/UI", items: project.caseStudy.uxUi },
    { label: "Choix techniques", items: project.caseStudy.technical },
  ];

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Étude de cas"
      subtitle={`${project.name} · ${project.sector}`}
    >
      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
        {project.highlight}
      </div>
      <div className="space-y-7">
        {sections.map((section) => (
          <div key={section.label}>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary-strong)]">
              {section.label}
            </h4>
            <ul className="space-y-2.5">
              {section.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-7 text-[var(--muted)]"
                >
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--ring)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary-strong)]">
            Résultat attendu
          </h4>
          <p className="text-sm leading-7 text-[var(--muted)]">
            {project.caseStudy.expectedResult}
          </p>
        </div>
      </div>
    </ModalShell>
  );
}

function CodeEditor({ filename, lines }: { filename: string; lines: CodeLine[] }) {
  return (
    <div className="vscode-window overflow-hidden rounded-2xl border border-[#2d2d2d]">
      <div className="flex items-center gap-2 border-b border-[#2d2d2d] bg-[#1e1e1e] px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex items-center gap-2 rounded-md bg-[#252526] px-3 py-1 text-xs text-[#cccccc]">
          <FileCode2 className="size-3.5 text-[#569cd6]" />
          {filename}
        </div>
      </div>
      <div className="max-h-[62vh] overflow-auto bg-[#1e1e1e] p-4 font-mono text-[13px] leading-6">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line) => (
              <tr key={line.number}>
                <td className="select-none pr-4 text-right align-top text-[#858585]">
                  {line.number}
                </td>
                <td className="whitespace-pre">
                  {line.tokens.length === 0 ? (
                    <span>&nbsp;</span>
                  ) : (
                    line.tokens.map((token, index) => (
                      <span
                        key={`${line.number}-${index}`}
                        className={tokenClasses[token.type]}
                      >
                        {token.text}
                      </span>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[#2d2d2d] bg-[#007acc] px-4 py-1.5 text-xs text-white/90">
        TypeScript React · UTF-8 · Espaces: 2
      </div>
    </div>
  );
}

type CodeModalProps = {
  project: ConceptProject | null;
  open: boolean;
  onClose: () => void;
};

export function CodeModal({ project, open, onClose }: CodeModalProps) {
  const [activeFile, setActiveFile] = useState(0);

  useEffect(() => {
    if (open) setActiveFile(0);
  }, [open, project?.id]);

  if (!project) return null;

  const currentFile = project.codeFiles[activeFile] ?? project.codeFiles[0];

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Aperçu technique"
      subtitle={`Architecture & composants · ${project.name}`}
      wide
    >
      {project.codeFiles.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {project.codeFiles.map((file, index) => (
            <button
              key={file.filename}
              type="button"
              onClick={() => setActiveFile(index)}
              className={cn(
                "rounded-lg border px-3 py-1.5 font-mono text-xs transition",
                activeFile === index
                  ? "border-[var(--ring)] bg-[var(--surface)] text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {file.filename}
            </button>
          ))}
        </div>
      ) : null}
      {currentFile ? (
        <CodeEditor filename={currentFile.filename} lines={currentFile.lines} />
      ) : null}
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        Extraits représentatifs du code de la démonstration. Ils illustrent
        l&apos;architecture, les composants et les fonctionnalités clés du projet
        type — stack Next.js, React et TypeScript.
      </p>
    </ModalShell>
  );
}
