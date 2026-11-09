import { assertProductionSafeConfig } from "./lib/margeo/config/assert-production-safe";

export async function register() {
  assertProductionSafeConfig();

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
}
