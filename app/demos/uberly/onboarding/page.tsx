import { OnboardingWizard } from "@/components/margeo/onboarding/onboarding-wizard";

export default function MargeoOnboardingPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <OnboardingWizard />
    </div>
  );
}
