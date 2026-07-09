"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ExternalLink, ShoppingBag } from "lucide-react";
import { confirmGroceryOAuthAction } from "@/lib/maison/onboarding-actions";
import { MAISON_PATHS } from "@/lib/maison/constants";
import { GROCERY_PROVIDERS } from "@/lib/maison/grocery-providers/config";
import { MaisonSignOutButton } from "@/components/maison/maison-sign-out-button";

export function ConnexionCoursesRetourClient({ state }: { state: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const res = await confirmGroceryOAuthAction(state);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setDone(true);
      router.push(res.data?.returnPath ?? MAISON_PATHS.home);
      router.refresh();
    });
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <div className="animate-rise mb-8">
          <div className="size-12 rounded-2xl bg-sage-soft grid place-items-center mb-5">
            <ShoppingBag className="h-5 w-5 text-sage" strokeWidth={1.75} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ash mb-2">Retour Maison</p>
          <h1 className="font-serif text-3xl text-ink mb-2 leading-tight">
            Connexion {GROCERY_PROVIDERS.leclerc_drive.label}
          </h1>
          <p className="text-sm text-ash leading-relaxed">
            Si vous venez de vous connecter sur e.Leclerc, confirmez ci-dessous pour lier votre
            compte au foyer Maison.
          </p>
        </div>

        <div className="rounded-2xl bg-paper ring-1 ring-black/[0.04] p-5 space-y-4 animate-rise delay-100">
          {done ? (
            <div className="flex items-center gap-3 text-sage">
              <Check className="h-5 w-5" />
              <p className="text-sm font-medium">Compte connecté — redirection…</p>
            </div>
          ) : (
            <>
              <a
                href="https://www.e.leclerc/auth"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm text-ash ring-1 ring-black/[0.06]"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir e.Leclerc dans un nouvel onglet
              </a>
              <button
                type="button"
                disabled={pending}
                onClick={handleConfirm}
                className="w-full bg-ink text-cream py-4 rounded-2xl text-sm font-medium disabled:opacity-50"
              >
                {pending ? <span className="maison-spinner" /> : "J'ai connecté mon compte — continuer"}
              </button>
            </>
          )}
        </div>

        {error ? <p className="text-xs text-center text-destructive mt-4">{error}</p> : null}

        <p className="text-center mt-8">
          <MaisonSignOutButton variant="link" />
        </p>
      </div>
    </div>
  );
}
