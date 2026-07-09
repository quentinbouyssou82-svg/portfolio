import { AuthForm } from "@/components/margeo/auth/auth-form";

export default function MargeoSignupPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <AuthForm mode="signup" />
    </div>
  );
}
