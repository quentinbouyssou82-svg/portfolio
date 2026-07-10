import { AuthForm } from "@/components/margeo/auth/auth-form";
import { LandingBackdrop } from "@/components/margeo/landing/landing-backdrop";

export default function MargeoLoginPage() {
  return (
    <>
      <LandingBackdrop />
      <div className="relative z-[1] flex min-h-dvh items-center justify-center p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-6">
        <AuthForm mode="login" premium />
      </div>
    </>
  );
}
