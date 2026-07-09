import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number = 400,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  const message = error instanceof Error ? error.message : "Erreur serveur";
  console.error("[uberly/api]", message, error);
  return NextResponse.json({ error: message }, { status: 500 });
}

export function logApi(event: string, meta?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[uberly/api] ${event}`, meta ?? "");
  }
}
