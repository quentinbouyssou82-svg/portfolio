import { AuthForm } from "@/components/margeo/auth/auth-form";

export default function MargeoLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <AuthForm mode="login" />
    </div>
  );
}
