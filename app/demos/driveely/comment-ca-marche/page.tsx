import { cookies } from "next/headers";
import { HowItWorksTour } from "@/components/margeo/onboarding/how-it-works-tour";
import { getAuthUser } from "@/lib/margeo/auth/session";
import { DRIVEELY_PATHS } from "@/lib/margeo/constants";
import {
  HOW_IT_WORKS_COOKIE,
  isHowItWorksCookieValue,
  resolveHowItWorksNext,
} from "@/lib/margeo/how-it-works";
import { ensureProfileForUser } from "@/lib/margeo/services/profile";
import { buildDriveelyMetadata } from "@/lib/margeo/seo";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
  const user = await getAuthUser();
  if (!user) redirect(DRIVEELY_PATHS.login);

  const profile = await ensureProfileForUser(
    user.id,
    user.user_metadata?.name as string | undefined,
  );
  if (!profile) redirect(DRIVEELY_PATHS.login);

  const params = await searchParams;
  const fallback = profile.onboardingCompleted
    ? DRIVEELY_PATHS.dashboard
    : DRIVEELY_PATHS.onboarding;
  const nextPath = resolveHowItWorksNext(params.next, fallback);

  const jar = await cookies();
  if (isHowItWorksCookieValue(jar.get(HOW_IT_WORKS_COOKIE)?.value)) {
    redirect(nextPath);
  }

  return <HowItWorksTour nextPath={nextPath} />;
}
