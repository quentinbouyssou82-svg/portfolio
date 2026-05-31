export type PriorityListSubmission = {
  name: string;
  email: string;
  company: string;
  website?: string;
  need: string;
};

export type PriorityListResponse = {
  ok: boolean;
  message?: string;
};

/**
 * Envoie une inscription à la liste prioritaire.
 * Brancher ici Notion, Tally ou un autre service via `/api/priority-list`.
 */
export async function submitPriorityList(
  data: PriorityListSubmission,
): Promise<PriorityListResponse> {
  const response = await fetch("/api/priority-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = (await response.json()) as PriorityListResponse;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.message ?? "Impossible d'enregistrer votre demande.");
  }

  return payload;
}

export const priorityListReassurance = [
  "Places limitées",
  "Sélection de quelques projets seulement",
  "Réponse prioritaire lors de l'ouverture",
] as const;

export const priorityListConfirmation =
  "Merci pour votre intérêt. Votre demande a bien été enregistrée dans la liste prioritaire.";
