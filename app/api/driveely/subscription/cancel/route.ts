import { NextResponse } from "next/server";
import { jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import {
  cancelSubscription,
  cancelSubscriptionImmediately,
} from "@/lib/margeo/services/subscription";

/** POST — annuler (fin de période par défaut, ?immediate=1 pour immédiat) */
export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    const url = new URL(request.url);
    const immediate =
      url.searchParams.get("immediate") === "1" ||
      url.searchParams.get("immediate") === "true";

    const body = (await request.json().catch(() => ({}))) as {
      immediate?: boolean;
    };

    const subscription =
      immediate || body.immediate
        ? await cancelSubscriptionImmediately(user.id)
        : await cancelSubscription(user.id);

    return NextResponse.json({ subscription });
  } catch (error) {
    return jsonError(error);
  }
}
