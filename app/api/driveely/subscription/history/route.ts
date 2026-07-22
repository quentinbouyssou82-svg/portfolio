import { NextResponse } from "next/server";
import { jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { listSubscriptionHistory } from "@/lib/margeo/services/subscription";

/** GET historique des changements d'abonnement */
export async function GET() {
  try {
    const user = await requireAuthUser();
    const history = await listSubscriptionHistory(user.id, 100);
    return NextResponse.json({ history });
  } catch (error) {
    return jsonError(error);
  }
}
