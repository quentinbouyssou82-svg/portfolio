import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { deleteUserAccount } from "@/lib/margeo/services/account";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";

/** DELETE — suppression complète du compte (RGPD). */
export async function DELETE(request: Request) {
  try {
    const user = await requireAuthUser();

    const limit = await checkRateLimitDistributed(
      `account-delete:${user.id}`,
      3,
      3_600_000,
    );
    if (!limit.allowed) {
      throw new ApiError(
        "Trop de tentatives. Réessaie plus tard.",
        429,
        "RATE_LIMITED",
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      confirm?: string;
    };
    if (body.confirm !== "DELETE") {
      throw new ApiError(
        'Confirme la suppression avec { "confirm": "DELETE" }.',
        400,
        "CONFIRMATION_REQUIRED",
      );
    }

    await deleteUserAccount(user.id);

    return NextResponse.json({ ok: true, deleted: true });
  } catch (error) {
    return jsonError(error);
  }
}
