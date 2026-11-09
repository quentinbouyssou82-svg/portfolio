import { NextResponse } from "next/server";
import { NotificationTypeV2 } from "@apple/app-store-server-library";
import {
  verifySignedStoreKitNotification,
  verifySignedStoreKitTransaction,
} from "@/lib/margeo/billing/app-store-verify";
import { applyAppStoreServerNotification } from "@/lib/margeo/services/subscription";

/**
 * App Store Server Notifications V2.
 * Configurer l'URL dans App Store Connect :
 * https://www.driveely.app/api/driveely/subscription/app-store-notifications
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      signedPayload?: string;
    };
    const signedPayload = body.signedPayload?.trim();
    if (!signedPayload) {
      return NextResponse.json({ error: "signedPayload manquant" }, { status: 400 });
    }

    const decoded = await verifySignedStoreKitNotification(signedPayload);
    if (!decoded.ok) {
      console.error("[driveely/asn] verify failed", decoded.reason);
      return NextResponse.json({ error: decoded.reason }, { status: 401 });
    }

    const notificationType = String(decoded.payload.notificationType ?? "");
    if (notificationType === NotificationTypeV2.TEST || notificationType === "TEST") {
      return NextResponse.json({ ok: true, test: true });
    }

    const signedTransactionInfo = decoded.payload.data?.signedTransactionInfo;
    if (!signedTransactionInfo) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const transaction = await verifySignedStoreKitTransaction(signedTransactionInfo);
    const originalTransactionId = transaction.ok
      ? transaction.transaction.originalTransactionId
      : null;
    if (!originalTransactionId) {
      console.warn("[driveely/asn] transaction non décodée", notificationType);
      return NextResponse.json({ ok: true, ignored: true });
    }

    await applyAppStoreServerNotification({
      originalTransactionId,
      productId: transaction.ok ? transaction.transaction.productId : null,
      notificationType,
      expiresAt: transaction.ok ? transaction.transaction.expiresAt : null,
      environment: transaction.ok ? transaction.transaction.environment : "unknown",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[driveely/asn] handler failed", error);
    return NextResponse.json({ error: "ASN handler failed" }, { status: 500 });
  }
}
