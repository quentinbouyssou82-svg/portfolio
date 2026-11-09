import type { SupabaseClient } from "@supabase/supabase-js";
import { createMargeoRequestDb } from "../supabase/request-db";
import { uploadScreenshotBuffer } from "./storage";

export type ProductFeedbackKind = "bug" | "idea" | "other" | "issue";

export type ProductFeedbackInput = {
  kind: ProductFeedbackKind;
  title: string;
  body: string;
  appVersion?: string | null;
  deviceModel?: string | null;
  osVersion?: string | null;
  userAgent?: string | null;
  isIOS?: boolean;
  channel?: string;
  screenshot?: {
    buffer: Buffer;
    ext: string;
    contentType: string;
  } | null;
  metadata?: Record<string, unknown>;
};

export type ProductFeedbackRow = {
  id: string;
  user_id: string;
  kind: ProductFeedbackKind;
  title: string;
  body: string;
  app_version: string | null;
  device_model: string | null;
  os_version: string | null;
  user_agent: string | null;
  is_ios: boolean;
  screenshot_path: string | null;
  screenshot_bucket: string | null;
  channel: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

async function feedbackDb(): Promise<SupabaseClient> {
  return createMargeoRequestDb();
}

export async function saveProductFeedback(
  userId: string,
  input: ProductFeedbackInput,
): Promise<ProductFeedbackRow | null> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return null;

  let screenshotPath: string | null = null;
  let screenshotBucket: string | null = null;

  if (input.screenshot?.buffer?.length) {
    const uploaded = await uploadScreenshotBuffer(
      userId,
      input.screenshot.buffer,
      input.screenshot.ext,
      input.screenshot.contentType,
    );
    if (uploaded) {
      screenshotPath = uploaded.path;
      screenshotBucket = uploaded.bucket;
    }
  }

  const supabase = await feedbackDb();
  const { data, error } = await supabase
    .from("margeo_product_feedback")
    .insert({
      user_id: userId,
      kind: input.kind,
      title,
      body,
      app_version: input.appVersion ?? null,
      device_model: input.deviceModel ?? null,
      os_version: input.osVersion ?? null,
      user_agent: input.userAgent ?? null,
      is_ios: input.isIOS ?? true,
      screenshot_path: screenshotPath,
      screenshot_bucket: screenshotBucket,
      channel: input.channel ?? "ios_app",
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error || !data) {
    console.warn("[driveely/product-feedback] insert failed:", error?.message);
    return null;
  }

  return data as ProductFeedbackRow;
}
