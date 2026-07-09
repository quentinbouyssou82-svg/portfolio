"use client";

import { useState, useTransition } from "react";
import { Check, ExternalLink, ShoppingCart, Store } from "lucide-react";
import type { LeclercIntegration } from "@/lib/maison/types";

type Props = {
  integration: LeclercIntegration | null;
  onConnectMock: () => Promise<void>;
  onConnectManual: () => Promise<void>;
  disabled?: boolean;
};

const STORES = [
  { id: "LECLERC-DRIVE-PARIS-15", label: "Paris 15e" },
  { id: "LECLERC-DRIVE-LYON-3", label: "Lyon 3e" },
  { id: "LECLERC-DRIVE-DEMO", label: "Démo" },
];

export function LeclercStep({
  integration,
  onConnectMock,
  onConnectManual,
  disabled,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [selectedStore, setSelectedStore] = useState(STORES[2].id);
  const connected = integration?.status === "connected_mock" || integration?.status === "connected";
  const manual = integration?.status === "manual";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-12 rounded-xl bg-white/15 grid place-items-center">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="font-serif text-xl leading-tight">e.Leclerc Drive</p>
            <p className="text-xs text-white/70">Synchronisez vos courses automatiquement</p>
          </div>
        </div>
        {(connected || manual) && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-white/15 text-sm">
            <Check className="h-4 w-4 shrink-0" />
            {integration?.accountLabel ?? "Connecté"}
          </div>
        )}
      </div>

      {!connected && !manual && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-ink/70 flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" />
              Magasin Drive
            </label>
            <select
              className="maison-input"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              disabled={disabled || pending}
            >
              {STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  Leclerc Drive — {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={disabled || pending}
            onClick={() => startTransition(() => onConnectMock())}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl text-sm font-medium disabled:opacity-50 active:scale-[0.99] transition-transform"
          >
            {pending ? <span className="maison-spinner" /> : (
              <>
                <ExternalLink className="h-4 w-4" />
                Connecter compte (simulation)
              </>
            )}
          </button>

          <button
            type="button"
            disabled={disabled || pending}
            onClick={() => startTransition(() => onConnectManual())}
            className="w-full py-3.5 rounded-2xl text-sm text-ash ring-1 ring-black/[0.06] hover:ring-black/12 transition-all"
          >
            Mode manuel (démo)
          </button>
        </>
      )}

      <div className="rounded-xl bg-paper ring-1 ring-black/[0.04] p-4 space-y-2 opacity-60">
        <p className="text-[10px] uppercase tracking-wider text-ash">Bientôt</p>
        <p className="text-xs text-ash">Netto Drive · Autres enseignes</p>
      </div>

      <p className="text-[10px] text-center text-ash leading-relaxed">
        La connexion OAuth e.Leclerc sera branchée sur l&apos;API officielle.
        En attendant, l&apos;export JSON reste compatible Drive.
      </p>
    </div>
  );
}
