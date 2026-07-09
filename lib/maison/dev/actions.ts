"use server";

import { redirect } from "next/navigation";
import { isMaisonDevModeAllowed } from "@/lib/maison/dev/constants";
import { enterDevModeAction as seedDevMode } from "@/lib/maison/dev/seed";
import { MAISON_PATHS } from "@/lib/maison/constants";

export async function enterDevModeAction(): Promise<void> {
  if (!isMaisonDevModeAllowed()) {
    throw new Error("Dev mode désactivé.");
  }
  await seedDevMode();
  redirect(MAISON_PATHS.home);
}
