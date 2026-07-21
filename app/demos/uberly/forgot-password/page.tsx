import { ForgotPasswordForm } from "@/components/margeo/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page flex min-h-dvh items-center justify-center overflow-x-clip p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-6">
      <ForgotPasswordForm />
    </div>
  );
}
