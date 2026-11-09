import * as Sentry from "@sentry/node";
import type { PipelineSnapshot } from "../pipeline-trace";
import { hashIdentifier, scrubObject } from "../security/pii-scrub";

export function isSentryEnabled(): boolean {
  return Boolean(process.env.SENTRY_DSN?.trim());
}

export function captureDriveelyError(
  error: unknown,
  context?: {
    step?: string;
    route?: string;
    userId?: string;
    extra?: Record<string, unknown>;
  },
): void {
  if (!isSentryEnabled()) return;

  Sentry.withScope((scope) => {
    if (context?.step) scope.setTag("step", context.step);
    if (context?.route) scope.setTag("route", context.route);
    if (context?.userId) scope.setUser({ id: hashIdentifier(context.userId) });
    if (context?.extra) {
      const safe = scrubObject(context.extra);
      for (const [key, value] of Object.entries(safe)) {
        scope.setExtra(key, value);
      }
    }
    Sentry.captureException(error);
  });
}

export function capturePipelineSnapshot(
  snapshot: PipelineSnapshot,
  meta?: { route?: string; userId?: string; failedStep?: string },
): void {
  if (!isSentryEnabled()) return;

  Sentry.withScope((scope) => {
    scope.setTag("route", meta?.route ?? "analyze");
    if (meta?.failedStep) scope.setTag("step", meta.failedStep);
    if (meta?.userId) scope.setUser({ id: hashIdentifier(meta.userId) });

    for (const step of snapshot.steps) {
      scope.setExtra(`step_${step.name}_ms`, step.durationMs);
      scope.setExtra(`step_${step.name}_status`, step.status);
      // Pas de detail brut (peut contenir noms de fichiers / messages)
    }

    scope.setExtra("pipeline_total_ms", snapshot.totalMs);
    scope.setExtra(
      "pipeline_meta",
      scrubObject(snapshot.meta as Record<string, unknown>),
    );

    const hasFailure = snapshot.steps.some(
      (s) => s.status === "fail" || s.status === "timeout",
    );
    if (hasFailure) {
      Sentry.captureMessage("analyze.pipeline_failure", "warning");
    }
  });
}

export function logVisionWaste(meta: Record<string, unknown>): void {
  const safe = scrubObject(meta);
  console.warn("[driveely/mistral] vision_failed_waste", JSON.stringify(safe));

  if (!isSentryEnabled()) return;

  Sentry.withScope((scope) => {
    scope.setTag("step", "vision");
    scope.setTag("event", "vision_failed_waste");
    for (const [key, value] of Object.entries(safe)) {
      scope.setExtra(key, value);
    }
    Sentry.captureMessage("mistral.vision_failed_waste", "warning");
  });
}
