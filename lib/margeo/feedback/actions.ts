"use server";

import { getAppFeatures } from "@/lib/margeo/config";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import type { FeedbackPayload, FeedbackResult } from "./types";

/**
 * Soumet un feedback bêta (bug / idée / problème).
 * Persisté via margeo_beta_events tant qu'une table dédiée n'existe pas.
 */
export async function submitFeedbackAction(
  input: FeedbackPayload,
): Promise<FeedbackResult> {
  const feats = getAppFeatures();
  if (!feats.feedback.enabled) {
    return {
      ok: false,
      message: "Feedback indisponible dans cet environnement.",
      code: "DISABLED",
    };
  }

  const kindOk =
    (input.kind === "bug" && feats.feedback.bugs) ||
    (input.kind === "idea" && feats.feedback.ideas) ||
    (input.kind === "issue" && feats.feedback.issues);

  if (!kindOk) {
    return {
      ok: false,
      message: "Ce type de feedback n'est pas activé.",
      code: "DISABLED",
    };
  }

  const title = input.title?.trim();
  const body = input.body?.trim();
  if (!title || !body) {
    return { ok: false, message: "Titre et description requis.", code: "ERROR" };
  }

  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Non authentifié.", code: "UNAUTHORIZED" };
  }

  try {
    await logBetaEvent({
      userId: user.id,
      eventType: "feedback_submitted",
      metadata: {
        channel: "beta_feedback",
        kind: input.kind,
        title,
        body,
        pageUrl: input.pageUrl ?? null,
        appMode: feats.mode,
        ...input.metadata,
      },
    });
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Envoi impossible. Réessaie plus tard.",
      code: "ERROR",
    };
  }
}
