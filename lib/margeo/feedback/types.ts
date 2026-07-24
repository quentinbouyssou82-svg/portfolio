/**
 * Feedback bêta — architecture prête, UI à brancher.
 * Types + actions stubs ; pas d'UI commerciale ici.
 */

export type FeedbackKind = "bug" | "idea" | "issue";

export type FeedbackPayload = {
  kind: FeedbackKind;
  title: string;
  body: string;
  pageUrl?: string;
  metadata?: Record<string, unknown>;
};

export type FeedbackResult =
  | { ok: true; id?: string }
  | { ok: false; message: string; code?: "DISABLED" | "UNAUTHORIZED" | "ERROR" };
