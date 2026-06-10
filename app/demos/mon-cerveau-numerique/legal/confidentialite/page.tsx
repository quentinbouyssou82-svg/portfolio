import Link from "next/link";
import { McnPageHeader } from "@/components/mon-cerveau-numerique/mcn-page-header";
import { McnCard, McnCardContent } from "@/components/mon-cerveau-numerique/ui/card";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";

export default function McnConfidentialitePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Link
        href={MCN_PATHS.home}
        className="text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
      >
        ← Retour
      </Link>
      <div className="mt-6">
        <McnPageHeader title="Politique de confidentialité" />
      </div>
      <McnCard>
        <McnCardContent className="space-y-4 text-sm leading-relaxed text-[var(--mcn-fg-muted)]">
          <p>
            Tes données sont chiffrées (AES-256) et hébergées en Europe. Aucun partage à des
            tiers. Conformité RGPD.
          </p>
          <p>
            Tu peux demander l&apos;export ou la suppression de tes données à tout moment via les
            paramètres ou en contactant le support.
          </p>
          <p className="text-[var(--mcn-fg-subtle)]">
            Version démo — contenu juridique à compléter avant mise en production.
          </p>
        </McnCardContent>
      </McnCard>
    </main>
  );
}
