import { initBotId } from "botid/client/core";

/**
 * BotID client — challenge invisible pour les routes web sensibles.
 * Les clients iOS natifs n'utilisent pas ce module (App Attest à la place).
 */
initBotId({
  protect: [
    // Do NOT protect /api/driveely/analyze here: native iOS cannot run BotID.
    // Analyze is gated by App Attest + assertBotIdOrThrow (skips X-Driveely-Client: ios).
    {
      path: "/login",
      method: "POST",
    },
    {
      path: "/signup",
      method: "POST",
    },
  ],
});
