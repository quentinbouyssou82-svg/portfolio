import { redirect } from "next/navigation";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

export default function BetaAliasPage() {
  redirect(DRIVEELY_PATHS.conditionsBeta);
}
