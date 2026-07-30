import { redirect } from "next/navigation";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

/**
 * Ancienne URL publique « Programme Bêta ».
 * La section s'appelle désormais Retour (in-app).
 */
export default function BetaRedirectPage() {
  redirect(DRIVEELY_PATHS.retour);
}
