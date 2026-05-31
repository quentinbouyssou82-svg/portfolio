import { NextResponse } from "next/server";
import { insertWaitlistEmail } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const result = await insertWaitlistEmail(email);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, code: result.code, hint: result.hint },
        { status: 500 },
      );
    }

    console.log("[waitlist] new signup:", email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[waitlist]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
