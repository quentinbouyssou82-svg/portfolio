"use client";

import { useState } from "react";
import { Plus, Mic, Send, Zap, MessageSquare, KeyRound, ExternalLink } from "lucide-react";
import { CHAT_PROMPTS } from "../../../_lib/dashboard-data";

export function ChatView() {
  const [showKeyModal, setShowKeyModal] = useState(true);
  const [message, setMessage] = useState("");

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)]">
      {/* Conversations sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-[var(--cn-border)] p-4 md:block">
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--cn-border)] bg-[var(--cn-surface)] py-2.5 text-sm font-medium text-[var(--cn-fg)] transition-colors hover:bg-[var(--cn-surface-2)]">
          <Plus className="size-4" />
          Nouvelle
        </button>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
            <MessageSquare className="size-7" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Chat MCP</h3>
            <p className="mt-1 max-w-md text-sm text-[var(--cn-muted)]">
              Posez n&apos;importe quelle question sur vos emails, documents,
              tâches ou agenda
            </p>
          </div>
          <div className="flex max-w-2xl flex-wrap justify-center gap-2">
            {CHAT_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => setMessage(p)}
                className="rounded-full border border-[var(--cn-border)] bg-[var(--cn-surface)] px-3.5 py-2 text-xs text-[var(--cn-muted)] transition-colors hover:border-white/20 hover:text-[var(--cn-fg)]"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--cn-border)] p-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-2xl border border-[var(--cn-border)] bg-[var(--cn-surface)] p-2">
              <textarea
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Posez une question… (Entrée pour envoyer, Shift+Entrée pour retour à la ligne)"
                className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] focus:outline-none"
              />
              <button
                aria-label="Dicter"
                className="flex size-9 items-center justify-center rounded-lg text-[var(--cn-muted)] hover:text-[var(--cn-fg)]"
              >
                <Mic className="size-4" />
              </button>
              <button
                disabled={!message.trim()}
                aria-label="Envoyer"
                className="flex size-9 items-center justify-center rounded-lg bg-[image:var(--cn-grad-primary)] text-white shadow-[var(--cn-glow)] disabled:opacity-40 disabled:shadow-none"
              >
                <Send className="size-4" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[var(--cn-faint)]">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" defaultChecked className="accent-[var(--cn-primary)]" />
                Interroger tous les comptes Gmail
              </label>
              <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--cn-border)] px-2.5 py-1 font-medium text-[var(--cn-muted)]">
                <Zap className="size-3" />
                Boost puissant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OpenRouter key modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[var(--cn-radius)] border border-[var(--cn-border)] bg-[var(--cn-bg-elev)] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
                <KeyRound className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">Clé OpenRouter requise</p>
                <p className="text-xs text-[var(--cn-faint)]">
                  Le Chat MCP utilise votre propre clé
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--cn-muted)]">
              Le Chat MCP tourne sur{" "}
              <strong className="text-[var(--cn-fg)]">votre propre clé OpenRouter</strong>{" "}
              — zéro coût pour l&apos;application. Les modèles gratuits sont
              disponibles dès l&apos;inscription.
            </p>
            <a
              href="https://openrouter.ai"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--cn-primary)] hover:brightness-110"
            >
              <ExternalLink className="size-3.5" />
              Créer une clé sur openrouter.ai
            </a>
            <label className="mt-4 block text-xs font-medium text-[var(--cn-muted)]">
              Votre clé API OpenRouter
            </label>
            <input
              placeholder="sk-or-v1-…"
              className="mt-1.5 w-full rounded-lg border border-[var(--cn-border)] bg-[var(--cn-surface)] px-3 py-2.5 text-sm text-[var(--cn-fg)] placeholder:text-[var(--cn-faint)] focus:border-[var(--cn-primary-border)]"
            />
            <button
              onClick={() => setShowKeyModal(false)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--cn-grad-primary)] py-2.5 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-all hover:brightness-110"
            >
              <KeyRound className="size-4" />
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
