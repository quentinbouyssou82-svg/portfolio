import { NextResponse } from "next/server";
import { addWaitlistEmail, getWaitlistCount } from "@/lib/waitlist-store";

function isValidEmail(email: string) {
  return email.includes("@") && email.length >= 3;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Adresse email invalide." },
        { status: 400 },
      );
    }

    const result = addWaitlistEmail(email);

    console.info("[waitlist] Inscription:", email, {
      duplicate: result.duplicate,
      total: getWaitlistCount(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[waitlist] Erreur:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 },
    );
  }
}
