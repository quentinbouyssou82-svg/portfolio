import { NextResponse } from "next/server";
import { ApiError, jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { deleteAnalysisForUser } from "@/lib/margeo/services/analyses";

/** DELETE — supprime une analyse (et la capture associée si présente). */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuthUser();
    const { id } = await context.params;
    if (!id?.trim()) {
      throw new ApiError("Identifiant manquant", 400, "INVALID_ID");
    }

    const ok = await deleteAnalysisForUser(user.id, id);
    if (!ok) {
      throw new ApiError("Analyse introuvable", 404, "NOT_FOUND");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
