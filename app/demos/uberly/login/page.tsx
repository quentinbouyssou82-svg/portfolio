import { AuthErrorBanner } from "@/components/margeo/auth/auth-error-banner";
import { AuthForm } from "@/components/margeo/auth/auth-form";
import { LandingBackdrop } from "@/components/margeo/landing/landing-backdrop";

export default async function MargeoLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; mode?: string }>;
}) {
  const { error, mode } = await searchParams;
  const isSignup = mode === "signup";

  return (
    <>
      <LandingBackdrop />
      <AuthErrorBanner message={error} />
      <div className="auth-page relative z-[1] flex min-h-dvh items-center justify-center overflow-x-clip p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-6">
        <AuthForm mode={isSignup ? "signup" : "login"} premium />
      </div>
    </>
  );
}
