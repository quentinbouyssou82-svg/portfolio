"use client";

import { Mail, ArrowRight } from "lucide-react";
import { ViewContainer } from "../shared";

export function MailsView() {
  return (
    <ViewContainer wide className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl border border-[var(--cn-primary-border)] bg-[var(--cn-primary-tint)] text-[var(--cn-primary)]">
          <Mail className="size-7" />
        </span>
        <h3 className="text-lg font-semibold">Connecte ton Gmail</h3>
        <button className="inline-flex items-center gap-2 rounded-full bg-[image:var(--cn-grad-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--cn-glow)] transition-transform hover:-translate-y-0.5">
          Connecter Gmail
          <ArrowRight className="size-4" />
        </button>
      </div>
    </ViewContainer>
  );
}
