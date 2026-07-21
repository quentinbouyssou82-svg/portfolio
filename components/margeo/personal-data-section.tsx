"use client";

import Link from "next/link";
import { Download, Mail, Shield, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/margeo/ui/button";
import { UBERLY_CONTACT_EMAIL } from "@/lib/margeo/brand";
import { UBERLY_PATHS } from "@/lib/margeo/constants";

const ACCOUNT_DELETION_MESSAGE =
  "La suppression complète de votre compte et de vos données peut être demandée par email.";

/**
 * Encart RGPD profil — export / suppression / contact.
 * Les actions non automatisées renvoient vers le support.
 */
export function PersonalDataSection() {
  const [showDeleteHelp, setShowDeleteHelp] = useState(false);
  const [showExportHelp, setShowExportHelp] = useState(false);

  return (
    <div className="rounded-xl border border-mg-border bg-mg-card/50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mg-accent-soft">
          <Shield className="size-5 text-mg-accent" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-mg-foreground">
            Données personnelles
          </p>
          <p className="mt-1 text-xs leading-relaxed text-mg-muted">
            Exercer vos droits RGPD (accès, portabilité, effacement).
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full justify-start min-h-10"
          onClick={() => {
            setShowExportHelp(true);
            setShowDeleteHelp(false);
          }}
        >
          <Download className="size-4" aria-hidden />
          Télécharger mes données
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full justify-start min-h-10 border border-mg-stop/30 text-mg-stop"
          onClick={() => {
            setShowDeleteHelp(true);
            setShowExportHelp(false);
          }}
        >
          <Trash2 className="size-4" aria-hidden />
          Demander la suppression de mon compte
        </Button>
        <a
          href={`mailto:${UBERLY_CONTACT_EMAIL}?subject=${encodeURIComponent(
            "Demande RGPD — Uberly",
          )}`}
          className="flex min-h-10 w-full items-center justify-start gap-2 rounded-xl border border-mg-border bg-[var(--mg-surface-muted)] px-3.5 text-xs font-medium text-mg-foreground transition-colors hover:bg-[var(--mg-nav-hover)]"
        >
          <Mail className="size-4" aria-hidden />
          Contact RGPD
        </a>
      </div>

      {showExportHelp && (
        <div className="mt-3 rounded-lg border border-mg-border bg-mg-background p-3 text-sm leading-relaxed text-mg-muted">
          L&apos;export automatique n&apos;est pas encore disponible. Envoie ta
          demande d&apos;accès / portabilité à{" "}
          <a
            href={`mailto:${UBERLY_CONTACT_EMAIL}?subject=${encodeURIComponent(
              "Export de mes données Uberly",
            )}`}
            className="font-medium text-mg-accent underline-offset-2 hover:underline"
          >
            {UBERLY_CONTACT_EMAIL}
          </a>
          . Voir aussi la{" "}
          <Link
            href={UBERLY_PATHS.demandesRgpd}
            className="font-medium text-mg-accent underline-offset-2 hover:underline"
          >
            gestion des demandes RGPD
          </Link>
          .
        </div>
      )}

      {showDeleteHelp && (
        <div className="mt-3 rounded-lg border border-mg-border bg-mg-background p-3 text-sm leading-relaxed text-mg-muted">
          <p className="text-mg-foreground">{ACCOUNT_DELETION_MESSAGE}</p>
          <p className="mt-2">
            Contact :{" "}
            <a
              href={`mailto:${UBERLY_CONTACT_EMAIL}?subject=${encodeURIComponent(
                "Demande de suppression de compte Uberly",
              )}`}
              className="font-medium text-mg-accent underline-offset-2 hover:underline"
            >
              {UBERLY_CONTACT_EMAIL}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
