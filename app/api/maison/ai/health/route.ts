import { NextResponse } from "next/server";
import { getQwenConfig, isQwenAvailable } from "@/lib/ai/qwen";

export async function GET() {
  const config = getQwenConfig();
  const available = await isQwenAvailable();

  if (!available) {
    return NextResponse.json(
      {
        ok: false,
        baseUrl: config.baseUrl,
        model: config.model,
        message: "Ollama indisponible — lancez « ollama serve » et « ollama pull " + config.model + " ».",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    baseUrl: config.baseUrl,
    model: config.model,
    message: "Qwen local prêt",
  });
}
