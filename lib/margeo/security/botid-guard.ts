/**
 * Vercel BotID — garde-fou pour endpoints web coûteux.
 * Les clients iOS natifs (header X-Driveely-Client: ios) sont exclus :
 * ils passent par App Attest, pas par le challenge navigateur.
 */

import { parseEnforcementMode, type SecurityEnforcementMode } from "./enforcement-mode";

export type BotIdGuardResult = {
  isBot: boolean;
  shouldBlock: boolean;
  skipped: boolean;
  reason: string;
  mode: SecurityEnforcementMode;
};

export function getBotIdConfig(): {
  enabled: boolean;
  mode: SecurityEnforcementMode;
} {
  return {
    enabled:
      process.env.BOTID_ENABLED === "true" || process.env.BOTID_ENABLED === "1",
    mode: parseEnforcementMode(process.env.BOTID_MODE, "log_only"),
  };
}

export async function evaluateBotId(
  request: Request,
): Promise<BotIdGuardResult> {
  const config = getBotIdConfig();
  const client = request.headers.get("x-driveely-client")?.trim().toLowerCase();

  if (client === "ios") {
    return {
      isBot: false,
      shouldBlock: false,
      skipped: true,
      reason: "ios_native_skip",
      mode: config.mode,
    };
  }

  if (!config.enabled) {
    return {
      isBot: false,
      shouldBlock: false,
      skipped: true,
      reason: "botid_disabled",
      mode: config.mode,
    };
  }

  try {
    const { checkBotId } = await import("botid/server");
    const verification = await checkBotId();
    const isBot = Boolean(verification.isBot);
    const result: BotIdGuardResult = {
      isBot,
      shouldBlock: isBot && config.mode === "strict",
      skipped: false,
      reason: isBot ? "bot_detected" : "human",
      mode: config.mode,
    };
    if (isBot) {
      console.warn("[driveely/security] botid", result);
    }
    return result;
  } catch (error) {
    console.warn("[driveely/security] botid_check_failed", error);
    // Ne jamais bloquer un humain si BotID est indisponible
    return {
      isBot: false,
      shouldBlock: false,
      skipped: true,
      reason: "botid_error_fail_open",
      mode: config.mode,
    };
  }
}

export async function assertBotIdOrThrow(request: Request): Promise<void> {
  const result = await evaluateBotId(request);
  if (result.shouldBlock) {
    const { ApiError } = await import("@/lib/margeo/api/errors");
    throw new ApiError("Accès refusé.", 403, "BOT_DETECTED");
  }
}
