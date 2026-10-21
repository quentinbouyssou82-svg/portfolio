/**
 * Trace structurée du pipeline d'analyse — une ligne JSON par requête.
 * Permet d'identifier précisément où le temps est perdu.
 */

export type PipelineStepStatus = "ok" | "fail" | "timeout" | "skipped";

export interface PipelineStep {
  name: string;
  durationMs: number;
  status: PipelineStepStatus;
  detail?: string;
}

export interface PipelineSnapshot {
  totalMs: number;
  steps: PipelineStep[];
  meta: Record<string, unknown>;
}

/** Budgets explicites — une étape secondaire ne doit jamais coller au timeout iOS/Vercel (~60s). */
export const ANALYZE_BUDGETS = {
  authMs: 3_000,
  profileMs: 2_500,
  quotaMs: 2_000,
  calibrationMs: 400,
  pickupMs: 800,
  persistMs: 2_000,
  visionProviderMs: 8_000,
} as const;

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout: () => T,
): Promise<{ value: T; timedOut: boolean; durationMs: number }> {
  const started = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await new Promise<
      | { kind: "ok"; value: T }
      | { kind: "err"; error: unknown }
      | { kind: "timeout" }
    >((resolve) => {
      timer = setTimeout(() => resolve({ kind: "timeout" }), timeoutMs);
      promise.then(
        (value) => resolve({ kind: "ok", value }),
        (error) => resolve({ kind: "err", error }),
      );
    });
    if (result.kind === "timeout") {
      void promise.catch(() => undefined);
      return {
        value: onTimeout(),
        timedOut: true,
        durationMs: Date.now() - started,
      };
    }
    if (result.kind === "err") {
      throw result.error;
    }
    return {
      value: result.value,
      timedOut: false,
      durationMs: Date.now() - started,
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export class AnalyzePipelineTrace {
  readonly startedAt = Date.now();
  readonly steps: PipelineStep[] = [];
  readonly meta: Record<string, unknown> = {};

  mark(
    name: string,
    started: number,
    status: PipelineStepStatus,
    detail?: string,
  ): number {
    const durationMs = Date.now() - started;
    this.steps.push({ name, durationMs, status, detail });
    return durationMs;
  }

  record(
    name: string,
    durationMs: number,
    status: PipelineStepStatus,
    detail?: string,
  ) {
    this.steps.push({ name, durationMs, status, detail });
  }

  setMeta(key: string, value: unknown) {
    this.meta[key] = value;
  }

  snapshot(): PipelineSnapshot {
    return {
      totalMs: Date.now() - this.startedAt,
      steps: this.steps,
      meta: this.meta,
    };
  }

  log(event = "analyze.pipeline") {
    const snap = this.snapshot();
    console.info(`[driveely/analyze] ${event}`, JSON.stringify(snap));
    return snap;
  }
}
