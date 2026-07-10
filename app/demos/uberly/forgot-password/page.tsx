import { ForgotPasswordForm } from "@/components/margeo/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <ForgotPasswordForm />
    </div>
  );
}
