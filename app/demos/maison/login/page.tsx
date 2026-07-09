import { redirect } from "next/navigation";
import { MAISON_PATHS } from "@/lib/maison/constants";

export default function MaisonLoginRedirect() {
  redirect(MAISON_PATHS.connexion);
}
