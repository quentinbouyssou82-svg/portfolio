import { ensureProfile } from "@/lib/control-tower/profile";
import {
  getControlTowerUserId,
  isPinSessionValid,
} from "@/lib/control-tower/pin-session";

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; message: string };

export async function requireAuth(): Promise<AuthResult> {
  if (!(await isPinSessionValid())) {
    return { ok: false, message: "Non connecté" };
  }

  const userId = getControlTowerUserId();
  if (!userId) {
    return {
      ok: false,
      message: "CONTROL_TOWER_USER_ID manquant dans .env.local",
    };
  }

  await ensureProfile(userId);
  return { ok: true, userId };
}
