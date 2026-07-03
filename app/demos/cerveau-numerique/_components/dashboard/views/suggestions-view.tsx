"use client";

import { Star } from "lucide-react";
import { EmptyState, ViewContainer } from "../shared";

export function SuggestionsView() {
  return (
    <ViewContainer wide>
      <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold">
        <Star className="size-4 text-[var(--cn-primary)]" />
        Suggestions personnalisées
      </h2>
      <EmptyState
        icon={Star}
        description="Aucune suggestion pour l'instant — elles apparaîtront après analyse de tes documents et de ta situation"
      />
      <p className="mt-4 text-center text-xs text-[var(--cn-faint)]">
        Les suggestions sont générées automatiquement chaque semaine selon ta
        situation, la saison et tes documents.
      </p>
    </ViewContainer>
  );
}
