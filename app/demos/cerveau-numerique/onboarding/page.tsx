import { Wizard } from "../_components/onboarding/wizard";

export default function OnboardingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="cn-aurora" aria-hidden />
      <Wizard />
    </main>
  );
}
