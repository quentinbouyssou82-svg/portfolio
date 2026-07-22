"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/margeo/ui/button";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

export function DeleteAnalysisButton({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/driveely/analyses/${analysisId}`, {
          method: "DELETE",
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(
            typeof body.error === "string"
              ? body.error
              : "Impossible de supprimer cette analyse.",
          );
          setConfirming(false);
          return;
        }
        toast.success("Analyse supprimée");
        router.push(DRIVEELY_PATHS.historique);
        router.refresh();
      } catch {
        toast.error("Erreur réseau. Réessaie.");
        setConfirming(false);
      }
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {confirming && (
        <p className="text-xs text-mg-muted sm:mr-2">
          Confirmer la suppression définitive ?
        </p>
      )}
      <Button
        type="button"
        variant={confirming ? "danger" : "secondary"}
        size="sm"
        disabled={pending}
        loading={pending}
        onClick={handleDelete}
        onBlur={() => {
          if (!pending) setConfirming(false);
        }}
      >
        <Trash2 className="size-4" aria-hidden />
        {confirming ? "Oui, supprimer" : "Supprimer cette analyse"}
      </Button>
      {confirming && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Annuler
        </Button>
      )}
    </div>
  );
}
