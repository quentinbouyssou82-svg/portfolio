import { OnboardingWizard } from "@/components/margeo/onboarding/onboarding-wizard";
import { getOnboardingDraft } from "@/lib/margeo/actions/onboarding";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { redirect } from "next/navigation";

export default async function MargeoOnboardingPage() {
  const draft = await getOnboardingDraft();
  if (draft === null) {
    const supabase = await import("@/lib/margeo/supabase/server").then((m) =>
      m.createMargeoServerClient(),
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect(UBERLY_PATHS.login);

    const { getProfileForUser } = await import("@/lib/margeo/services/profile");
    const profile = await getProfileForUser(user.id);
    if (profile?.onboardingCompleted) {
      redirect(UBERLY_PATHS.dashboard);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <OnboardingWizard initial={draft ?? undefined} />
    </div>
  );
}
