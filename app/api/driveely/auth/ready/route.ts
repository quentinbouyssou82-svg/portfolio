import { NextResponse } from "next/server";
import { getPostAuthPath } from "@/lib/margeo/auth/post-auth";
import { resolveSafePostAuthNext } from "@/lib/margeo/auth/safe-next";
import { waitForAuthUser, waitForProfile } from "@/lib/margeo/auth/wait";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Cookie-based auth readiness probe (preferred over Server Actions right
 * after sign-in — the browser jar is sent on the GET immediately).
 *
 * GET /api/driveely/auth/ready?next=/dashboard
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const preferred = resolveSafePostAuthNext(
    url.searchParams.get("next"),
    "",
  );

  try {
    const user = await waitForAuthUser(4, 100);
    if (!user) {
      return NextResponse.json(
        { status: "unauthenticated" as const },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const profile = await waitForProfile(user, 4, 100);
    if (!profile) {
      return NextResponse.json(
        { status: "pending" as const },
        { status: 202, headers: { "Cache-Control": "no-store" } },
      );
    }

    let redirectTo = preferred;
    if (
      !redirectTo ||
      redirectTo === DRIVEELY_PATHS.login ||
      redirectTo.startsWith(`${DRIVEELY_PATHS.login}?`)
    ) {
      try {
        redirectTo = await getPostAuthPath(
          user.id,
          user.user_metadata?.name as string | undefined,
        );
      } catch {
        redirectTo = profile.onboardingCompleted
          ? DRIVEELY_PATHS.dashboard
          : DRIVEELY_PATHS.onboarding;
      }
    }

    return NextResponse.json(
      { status: "ready" as const, redirectTo },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[driveely/auth/ready]", err);
    return NextResponse.json(
      { status: "pending" as const },
      { status: 202, headers: { "Cache-Control": "no-store" } },
    );
  }
}
