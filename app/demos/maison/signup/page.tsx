import { redirect } from "next/navigation";
import { MAISON_PATHS } from "@/lib/maison/constants";

export default function MaisonSignupRedirect() {
  redirect(MAISON_PATHS.connexion);
}
