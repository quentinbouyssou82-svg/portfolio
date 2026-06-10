"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { McnPageHeader } from "@/components/mon-cerveau-numerique/mcn-page-header";
import { McnPageSkeleton } from "@/components/mon-cerveau-numerique/mcn-page-skeleton";
import { McnButton } from "@/components/mon-cerveau-numerique/ui/button";
import { McnCard, McnCardContent } from "@/components/mon-cerveau-numerique/ui/card";
import { McnSeparator } from "@/components/mon-cerveau-numerique/ui/separator";
import { useMcnStore } from "@/hooks/use-mcn-store";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";

export function McnSettingsPanel() {
  const { data, ready, resetStore } = useMcnStore();

  if (!ready) {
    return <McnPageSkeleton variant="form" />;
  }

  const fields = [
    { label: "Email", value: "demo@mon-cerveau-numerique.app" },
    { label: "Nom affiché", value: data.profile.display_name ?? "—" },
    {
      label: "Priorités",
      value: data.profile.priorities?.length ? data.profile.priorities.join(", ") : "—",
    },
  ] as const;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <McnPageHeader
        title="Paramètres"
        description="Gère ton compte et tes préférences."
      />

      <McnCard className="max-w-lg">
        <McnCardContent className="space-y-0 p-0">
          {fields.map((field, i) => (
            <div key={field.label}>
              {i > 0 ? <McnSeparator /> : null}
              <div className="px-5 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--mcn-fg-subtle)]">
                  {field.label}
                </p>
                <p className="mt-1 text-sm text-[var(--mcn-fg)]">{field.value}</p>
              </div>
            </div>
          ))}
        </McnCardContent>
      </McnCard>

      <div className="flex max-w-lg flex-col gap-2 sm:flex-row">
        <McnButton
          type="button"
          variant="outline"
          className="flex-1"
          onClick={resetStore}
        >
          <RotateCcw className="size-4" />
          Réinitialiser les données démo
        </McnButton>
        <Link href={MCN_PATHS.login} className="flex-1">
          <McnButton variant="secondary" className="w-full">
            Retour login
          </McnButton>
        </Link>
      </div>
    </div>
  );
}
