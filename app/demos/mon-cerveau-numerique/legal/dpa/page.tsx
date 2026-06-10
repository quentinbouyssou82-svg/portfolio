import Link from "next/link";
import { McnPageHeader } from "@/components/mon-cerveau-numerique/mcn-page-header";
import { McnCard, McnCardContent } from "@/components/mon-cerveau-numerique/ui/card";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";

export default function McnDpaPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link
        href={MCN_PATHS.home}
        className="text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
      >
        ← Retour
      </Link>
      <div className="mt-6">
        <McnPageHeader title="Accord de traitement des données (DPA)" />
      </div>
      <McnCard>
        <McnCardContent className="space-y-4 text-sm leading-relaxed text-[var(--mcn-fg-muted)]">
          <p>
            Ce document définit les conditions de traitement des données personnelles entre
            l&apos;utilisateur et Mon Cerveau Numérique, conformément au RGPD.
          </p>
          <p>
            Le sous-traitant technique (hébergement, base de données) est limité aux besoins
            strictement nécessaires au fonctionnement du service.
          </p>
          <p className="text-[var(--mcn-fg-subtle)]">
            Version démo — contenu juridique à compléter avant mise en production.
          </p>
        </McnCardContent>
      </McnCard>
    </main>
  );
}
