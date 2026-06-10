import { NextResponse } from "next/server";
import { syncWaitlistToNotion } from "@/lib/notion-waitlist";
import { insertWaitlistEntry } from "@/lib/supabase";

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch (parseErr) {
    console.error("[waitlist] JSON invalide:", parseErr);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.info("[waitlist] body reçu:", JSON.stringify(body));

  const email = typeof (body as { email?: unknown })?.email === "string"
    ? (body as { email: string }).email.trim()
    : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const entry = { email, source: "waitlist_email" };
  console.info("[waitlist] entry:", JSON.stringify(entry));

  const result = await insertWaitlistEntry(entry);
  console.info("[waitlist] Supabase:", JSON.stringify(result));

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, code: result.code, hint: result.hint },
      { status: 500 },
    );
  }

  try {
    const notionResult = await syncWaitlistToNotion(entry);
    console.info("[waitlist] Notion:", JSON.stringify(notionResult));
  } catch (notionErr) {
    console.error("[waitlist] Notion exception (Supabase OK):", notionErr);
  }

  return NextResponse.json({ success: true });
}
