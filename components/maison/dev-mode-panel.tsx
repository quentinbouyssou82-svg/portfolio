"use client";

import { useTransition } from "react";
import { FlaskConical, Home, ShieldAlert } from "lucide-react";
import { enterDevModeAction } from "@/lib/maison/dev/actions";
import { DEV_ADMIN_PIN, DEV_HOUSEHOLD_KEY } from "@/lib/maison/dev/constants";

export function DevModePanel() {
  const [pending, startTransition] = useTransition();

  function handleEnter() {
    startTransition(async () => {
      try {
        await enterDevModeAction();
      } catch {
        /* redirect throws */
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#e8e4dc] flex items-center justify-center px-6 py-12 font-mono">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-3 text-amber-400">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-xs uppercase tracking-widest">Dev only — non visible en prod</span>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <FlaskConical className="h-8 w-8 text-emerald-400" />
            <h1 className="text-2xl font-bold">Maison Dev Mode</h1>
          </div>
          <p className="text-sm text-[#9a9590] leading-relaxed">
            Accès instantané sans créer de foyer. Simule un foyer complet avec 3 membres,
            préférences alimentaires, planning repas, courses et budget.
          </p>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 space-y-2 text-xs">
          <p><span className="text-[#6a6560]">Clé :</span> {DEV_HOUSEHOLD_KEY}</p>
          <p><span className="text-[#6a6560]">PIN admin :</span> {DEV_ADMIN_PIN}</p>
          <p><span className="text-[#6a6560]">Membres :</span> Quentin, Marie, Chloé</p>
        </div>

        <button
          type="button"
          onClick={handleEnter}
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {pending ? "Initialisation…" : (
            <>
              <Home className="h-4 w-4" />
              Entrer dans le foyer démo
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-[#5a5550]">
          Désactivé en production sauf si{" "}
          <code className="text-amber-400/80">MAISON_DEV_MODE=true</code>
        </p>

        <a href="/demos" className="block text-center text-xs text-[#6a6560] hover:text-[#9a9590]">
          ← Retour aux démos
        </a>
      </div>
    </div>
  );
}
