import { NextResponse } from "next/server";
import { ApiError, jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { listAnalysesForUser } from "@/lib/margeo/services/analyses";
import { assertEntitlement } from "@/lib/margeo/services/subscription";

/** Export CSV — Elite uniquement (vérification serveur). */
export async function GET() {
  try {
    const user = await requireAuthUser();
    await assertEntitlement(user.id, "canExportCSV");

    const analyses = await listAnalysesForUser(user.id, 500);
    const header = [
      "date",
      "plateforme",
      "depart",
      "arrivee",
      "brut",
      "net",
      "eur_h",
      "score",
      "verdict",
    ].join(",");

    const lines = analyses.map((a) =>
      [
        a.analyzedAt,
        JSON.stringify(a.offer.platform),
        JSON.stringify(a.offer.pickup),
        JSON.stringify(a.offer.dropoff),
        a.grossGain.toFixed(2),
        a.netGain.toFixed(2),
        a.hourlyRate.toFixed(2),
        a.score,
        a.verdict,
      ].join(","),
    );

    const csv = [header, ...lines].join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="driveely-export.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof ApiError) return jsonError(error);
    return jsonError(error);
  }
}
