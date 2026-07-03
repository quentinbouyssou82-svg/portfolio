import { LoginForm } from "../_components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="cn-aurora" aria-hidden />
      <div className="relative z-10 w-full max-w-[420px]">
        <LoginForm />
      </div>
    </main>
  );
}
