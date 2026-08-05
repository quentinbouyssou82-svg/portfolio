import { cookies } from "next/headers";
import { HowItWorksTour } from "@/components/margeo/onboarding/how-it-works-tour";
import { waitForAuthUser, waitForProfile } from "@/lib/margeo/auth/wait";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import {
  HOW_IT_WORKS_COOKIE,
  isHowItWorksCookieValue,
  resolveHowItWorksNext,
} from "@/lib/margeo/how-it-works";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

/** Cookie-gated; never cache a seen→dashboard redirect for unseen users. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildDriveelyMetadata({
  title: "Comment ça marche",
  description: "Comment fonctionne Driveely — capture, analyse, décision.",
  path: "/comment-ca-marche",
  index: false,
  follow: false,
});

export default async function CommentCaMarchePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await waitForAuthUser();
  if (!user) redirect(DRIVEELY_PATHS.login);

  const profile = await waitForProfile(user);
  if (!profile) redirect(DRIVEELY_PATHS.login);

  const params = await searchParams;
  const fallback = profile.onboardingCompleted
    ? DRIVEELY_PATHS.dashboard
    : DRIVEELY_PATHS.onboarding;
  const nextPath = resolveHowItWorksNext(params.next, fallback);

  // Backup: cookie only. Missing cookie ⇒ tour stays reachable.
  const jar = await cookies();
  if (isHowItWorksCookieValue(jar.get(HOW_IT_WORKS_COOKIE)?.value)) {
    redirect(nextPath);
  }

  return <HowItWorksTour nextPath={nextPath} />;
}
