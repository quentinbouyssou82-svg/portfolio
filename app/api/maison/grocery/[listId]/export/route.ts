import { NextResponse } from "next/server";
import { exportGroceryListAction } from "@/lib/maison/actions";
import { requireMaisonAdmin } from "@/lib/maison/auth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ listId: string }> },
) {
  try {
    await requireMaisonAdmin();
    const { listId } = await params;
    const result = await exportGroceryListAction(listId);

    if (!result.ok || !result.data) {
      return NextResponse.json(
        { error: result.ok ? "Export vide" : result.message },
        { status: 400 },
      );
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
