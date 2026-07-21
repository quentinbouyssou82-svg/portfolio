import { redirect } from "next/navigation";
import { UBERLY_PATHS } from "@/lib/margeo/constants";

export default function BetaAliasPage() {
  redirect(UBERLY_PATHS.conditionsBeta);
}
