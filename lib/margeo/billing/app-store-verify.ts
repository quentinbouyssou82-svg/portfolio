/**
 * Vérification StoreKit 2 — JWS signé Apple (App Store Server API library).
 * Source de vérité pour l'activation premium iOS ; jamais le seul `planId` client.
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  Environment,
  SignedDataVerifier,
  VerificationException,
} from "@apple/app-store-server-library";
import { mapIOSProductId } from "./app-store-products";
import type { BillingPeriod } from "./provider";
import type { DriveelyPlanId } from "@/lib/margeo/plans";

export type VerifiedStoreKitTransaction = {
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  planId: DriveelyPlanId;
  billingPeriod: BillingPeriod;
  expiresAt: string | null;
  environment: "Sandbox" | "Production";
  bundleId: string;
};

const verifierCache = new Map<Environment, SignedDataVerifier | null>();

function loadAppleRootCAs(): Buffer[] {
  const certDir = join(process.cwd(), "lib/margeo/billing/certs");
  const names = [
    "AppleIncRootCertificate.cer",
    "AppleRootCA-G2.cer",
    "AppleRootCA-G3.cer",
  ];
  return names.map((name) => readFileSync(join(certDir, name)));
}

export function appleRootCAsAvailable(): boolean {
  try {
    return loadAppleRootCAs().length === 3;
  } catch {
    return false;
  }
}

function resolvePreferredEnvironment(): Environment {
  const raw = process.env.APPLE_APP_STORE_ENVIRONMENT?.trim().toLowerCase();
  if (raw === "sandbox" || raw === "xcode") return Environment.SANDBOX;
  if (raw === "production") return Environment.PRODUCTION;
  if (process.env.VERCEL_ENV === "production") return Environment.PRODUCTION;
  return Environment.SANDBOX;
}

function getVerifier(environment: Environment): SignedDataVerifier | null {
  if (verifierCache.has(environment)) {
    return verifierCache.get(environment) ?? null;
  }

  const bundleId =
    process.env.APPLE_APP_STORE_BUNDLE_ID?.trim() || "app.driveely.ios";
  const appAppleIdRaw = process.env.APPLE_APP_STORE_APP_ID?.trim();
  const appAppleId = appAppleIdRaw
    ? parseInt(appAppleIdRaw, 10)
    : undefined;

  if (environment === Environment.PRODUCTION && !appAppleId) {
    console.warn(
      "[driveely/storekit] APPLE_APP_STORE_APP_ID requis en Production — vérification indisponible",
    );
    verifierCache.set(environment, null);
    return null;
  }

  try {
    const roots = loadAppleRootCAs();
    const verifier = new SignedDataVerifier(
      roots,
      true,
      environment,
      bundleId,
      appAppleId,
    );
    verifierCache.set(environment, verifier);
    return verifier;
  } catch (error) {
    console.error("[driveely/storekit] init verifier failed:", error);
    verifierCache.set(environment, null);
    return null;
  }
}

export function isAppStoreVerificationConfigured(): boolean {
  if (!appleRootCAsAvailable()) return false;
  const preferred = resolvePreferredEnvironment();
  return getVerifier(preferred) != null || getVerifier(Environment.SANDBOX) != null;
}

function verificationOrder(): Environment[] {
  const preferred = resolvePreferredEnvironment();
  const other =
    preferred === Environment.PRODUCTION
      ? Environment.SANDBOX
      : Environment.PRODUCTION;
  return [preferred, other];
}

export type StoreKitVerificationResult =
  | { ok: true; transaction: VerifiedStoreKitTransaction }
  | { ok: false; reason: string; retryable: boolean };

export async function verifySignedStoreKitTransaction(
  signedTransactionInfo: string,
): Promise<StoreKitVerificationResult> {
  const trimmed = signedTransactionInfo.trim();
  if (!trimmed) {
    return { ok: false, reason: "signedTransactionInfo vide", retryable: false };
  }

  let lastFailure: StoreKitVerificationResult = {
    ok: false,
    reason: "Vérification App Store non configurée côté serveur",
    retryable: true,
  };

  for (const environment of verificationOrder()) {
    const verifier = getVerifier(environment);
    if (!verifier) continue;

    const decoded = await decodeVerifiedTransaction(verifier, trimmed);
    if (decoded.ok) return decoded;
    lastFailure = decoded;
  }

  return lastFailure;
}

async function decodeVerifiedTransaction(
  verifier: SignedDataVerifier,
  trimmed: string,
): Promise<StoreKitVerificationResult> {
  try {
    const payload = await verifier.verifyAndDecodeTransaction(trimmed);

    const productId = payload.productId?.trim();
    if (!productId) {
      return { ok: false, reason: "productId absent du reçu", retryable: false };
    }

    const mapping = mapIOSProductId(productId);
    if (!mapping) {
      return {
        ok: false,
        reason: `Product ID inconnu: ${productId}`,
        retryable: false,
      };
    }

    if (payload.revocationDate != null) {
      return {
        ok: false,
        reason: "Transaction révoquée par Apple",
        retryable: false,
      };
    }

    const expiresMs = payload.expiresDate;
    if (expiresMs != null && expiresMs < Date.now()) {
      return {
        ok: false,
        reason: "Abonnement expiré selon Apple",
        retryable: false,
      };
    }

    const transactionId = payload.transactionId ?? "";
    const originalTransactionId =
      payload.originalTransactionId ?? transactionId;

    if (!transactionId) {
      return {
        ok: false,
        reason: "transactionId absent du reçu",
        retryable: false,
      };
    }

    const envLabel =
      payload.environment === Environment.PRODUCTION
        ? "Production"
        : "Sandbox";

    return {
      ok: true,
      transaction: {
        transactionId,
        originalTransactionId,
        productId,
        planId: mapping.planId,
        billingPeriod: mapping.billingPeriod,
        expiresAt:
          expiresMs != null ? new Date(expiresMs).toISOString() : null,
        environment: envLabel,
        bundleId: payload.bundleId ?? "app.driveely.ios",
      },
    };
  } catch (error) {
    const message =
      error instanceof VerificationException
        ? `Vérification Apple échouée (${error.status})`
        : error instanceof Error
          ? error.message
          : "Vérification Apple échouée";
    return {
      ok: false,
      reason: message,
      retryable: error instanceof VerificationException,
    };
  }
}

export async function verifySignedStoreKitNotification(
  signedPayload: string,
): Promise<
  | { ok: true; payload: Awaited<ReturnType<SignedDataVerifier["verifyAndDecodeNotification"]>> }
  | { ok: false; reason: string }
> {
  const trimmed = signedPayload.trim();
  if (!trimmed) return { ok: false, reason: "signedPayload vide" };

  let lastReason = "Vérification notification App Store non configurée";
  for (const environment of verificationOrder()) {
    const verifier = getVerifier(environment);
    if (!verifier) continue;
    try {
      const payload = await verifier.verifyAndDecodeNotification(trimmed);
      return { ok: true, payload };
    } catch (error) {
      lastReason =
        error instanceof Error ? error.message : "Notification Apple invalide";
    }
  }
  return { ok: false, reason: lastReason };
}
