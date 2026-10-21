import { NextResponse } from "next/server";
import { jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { issueAppAttestChallenge } from "@/lib/margeo/security/app-attest";

/** POST — émet un challenge App Attest (anti-replay). */
export async function POST() {
  try {
    const user = await requireAuthUser();
    const issued = await issueAppAttestChallenge(user.id);
    return NextResponse.json(issued);
  } catch (error) {
    return jsonError(error);
  }
}
