"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DRIVEELY_CONTACT_EMAIL } from "@/lib/margeo/brand";
import { Button } from "@/components/margeo/ui/button";

const ACCOUNT_DELETION_MESSAGE =
  "La suppression complète de votre compte et de vos données peut être demandée par email.";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-mg-stop/25 bg-mg-stop-soft/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-mg-foreground">
            Zone sensible
          </p>
          <p className="mt-1 text-xs leading-relaxed text-mg-muted">
            Demande de suppression de compte (RGPD).
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="min-h-10 shrink-0 border border-mg-stop/35 text-mg-stop hover:border-mg-stop/55"
          onClick={() => setOpen((v) => !v)}
        >
          <Trash2 className="size-4" aria-hidden />
          Supprimer mon compte
        </Button>
      </div>

      {open && (
        <div
          className="mt-4 rounded-lg border border-mg-border bg-mg-card p-4"
          role="status"
        >
          <p className="text-sm leading-relaxed text-mg-foreground">
            {ACCOUNT_DELETION_MESSAGE}
          </p>
          <p className="mt-3 text-sm text-mg-muted">
            Écris-nous à{" "}
            <a
              href={`mailto:${DRIVEELY_CONTACT_EMAIL}?subject=${encodeURIComponent(
                "Demande de suppression de compte Driveely",
              )}`}
              className="font-medium text-mg-accent underline-offset-2 hover:underline"
            >
              {DRIVEELY_CONTACT_EMAIL}
            </a>
            .
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={() => setOpen(false)}
          >
            Fermer
          </Button>
        </div>
      )}
    </div>
  );
}
