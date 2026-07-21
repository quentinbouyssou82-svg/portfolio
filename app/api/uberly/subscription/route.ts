import { NextResponse } from "next/server";
import { jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import {
  getCurrentSubscription,
  getUserEntitlements,
  listSubscriptionHistory,
} from "@/lib/margeo/services/subscription";

/** GET abonnement actuel + entitlements */
export async function GET() {
  try {
    const user = await requireAuthUser();
    const [subscription, entitlements, history] = await Promise.all([
      getCurrentSubscription(user.id),
      getUserEntitlements(user.id),
      listSubscriptionHistory(user.id, 20),
    ]);

    return NextResponse.json({
      subscription,
      entitlements,
      history,
    });
  } catch (error) {
    return jsonError(error);
  }
}
