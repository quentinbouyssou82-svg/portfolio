import Link from "next/link";
import { McnPageHeader } from "@/components/mon-cerveau-numerique/mcn-page-header";
import { McnCard, McnCardContent } from "@/components/mon-cerveau-numerique/ui/card";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";

export default function McnCguPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link
        href={MCN_PATHS.home}
        className="text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
      >
        ← Retour
      </Link>
      <div className="mt-6">
        <McnPageHeader title="Conditions Générales d'Utilisation" />
      </div>
      <McnCard>
        <McnCardContent className="space-y-4 text-sm leading-relaxed text-[var(--mcn-fg-muted)]">
          <p>
            Mon Cerveau Numérique est un assistant personnel de gestion documentaire et
            organisationnelle. L&apos;utilisation du service implique l&apos;acceptation des
            présentes conditions.
          </p>
          <p>
            Le service est fourni en l&apos;état. L&apos;utilisateur reste propriétaire de ses
            données. Aucune action automatisée n&apos;est effectuée sans confirmation explicite.
          </p>
          <p className="text-[var(--mcn-fg-subtle)]">
            Version démo — contenu juridique à compléter avant mise en production.
          </p>
        </McnCardContent>
      </McnCard>
    </main>
  );
}
