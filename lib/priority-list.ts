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
 * Envoie une inscription à la liste prioritaire (Supabase + Notion).
 */
export async function submitPriorityList(
  data: PriorityListSubmission,
): Promise<PriorityListResponse> {
  const body = {
    name: data.name.trim(),
    email: data.email.trim(),
    company: data.company.trim(),
    need: data.need.trim(),
    ...(data.website?.trim() ? { website: data.website.trim() } : {}),
  };

  if (process.env.NODE_ENV === "development") {
    console.info("[priority-list] fetch payload:", JSON.stringify(body));
  }

  const response = await fetch("/api/priority-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = (await response.json()) as PriorityListResponse;

  if (!response.ok || !result.ok) {
    throw new Error(result.message ?? "Impossible d'enregistrer votre demande.");
  }

  return result;
}

export const priorityListReassurance = [
  "Places limitées",
  "Sélection de quelques projets seulement",
  "Réponse prioritaire lors de l'ouverture",
] as const;

export const priorityListConfirmation =
  "Merci pour votre intérêt. Votre demande a bien été enregistrée dans la liste prioritaire.";
