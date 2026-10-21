import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";
import {
  saveProductFeedback,
  type ProductFeedbackKind,
} from "@/lib/margeo/services/product-feedback";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";

const ALLOWED_KINDS = new Set<ProductFeedbackKind>([
  "bug",
  "idea",
  "other",
  "issue",
]);

function parseKind(raw: FormDataEntryValue | null): ProductFeedbackKind {
  const value = String(raw ?? "bug").trim().toLowerCase();
  if (value === "idée" || value === "idee") return "idea";
  if (ALLOWED_KINDS.has(value as ProductFeedbackKind)) {
    return value as ProductFeedbackKind;
  }
  return "other";
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();

    const limit = await checkRateLimitDistributed(`product-feedback:${user.id}`, 8, 60_000);
    if (!limit.allowed) {
      throw new ApiError("Trop de requêtes", 429, "RATE_LIMITED");
    }

    const form = await request.formData();
    const kind = parseKind(form.get("kind"));
    const title = String(form.get("title") ?? "").trim();
    const body = String(form.get("body") ?? form.get("message") ?? "").trim();

    if (!title || !body) {
      throw new ApiError("Titre et message requis", 400, "VALIDATION");
    }
    if (title.length > 200) {
      throw new ApiError("Titre trop long", 400, "VALIDATION");
    }
    if (body.length > 8000) {
      throw new ApiError("Message trop long", 400, "VALIDATION");
    }

    const screenshotEntry = form.get("screenshot");
    let screenshot: {
      buffer: Buffer;
      ext: string;
      contentType: string;
    } | null = null;

    if (screenshotEntry instanceof File && screenshotEntry.size > 0) {
      if (screenshotEntry.size > 10 * 1024 * 1024) {
        throw new ApiError("Capture trop volumineuse (max 10 Mo)", 400, "VALIDATION");
      }
      const contentType = screenshotEntry.type || "image/jpeg";
      if (!contentType.startsWith("image/")) {
        throw new ApiError("Format de capture invalide", 400, "VALIDATION");
      }
      const ext = contentType.includes("png") ? "png" : "jpg";
      screenshot = {
        buffer: Buffer.from(await screenshotEntry.arrayBuffer()),
        ext,
        contentType,
      };
    }

    const row = await saveProductFeedback(user.id, {
      kind,
      title,
      body,
      appVersion: String(form.get("appVersion") ?? "").trim() || null,
      deviceModel: String(form.get("deviceModel") ?? "").trim() || null,
      osVersion: String(form.get("osVersion") ?? "").trim() || null,
      userAgent: String(form.get("userAgent") ?? "").trim() || null,
      isIOS: String(form.get("isIOS") ?? "true") !== "false",
      channel: String(form.get("channel") ?? "ios_app").trim() || "ios_app",
      screenshot,
      metadata: {
        source: "ios_app",
      },
    });

    if (!row) {
      throw new ApiError(
        "Impossible d'enregistrer ton retour. Réessaie.",
        500,
        "SAVE_FAILED",
      );
    }

    await logBetaEvent({
      userId: user.id,
      eventType: "feedback_submitted",
      metadata: {
        channel: "product_feedback",
        kind,
        feedbackId: row.id,
        hasScreenshot: Boolean(row.screenshot_path),
      },
    });

    return NextResponse.json({
      ok: true,
      feedback: {
        id: row.id,
        kind: row.kind,
        title: row.title,
        createdAt: row.created_at,
        hasScreenshot: Boolean(row.screenshot_path),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
