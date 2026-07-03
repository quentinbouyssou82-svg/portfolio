"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import { AuthCard } from "./auth-card";
import { GoogleButton } from "./google-button";
import { TextField, PasswordField } from "./text-field";
import { Button } from "../ui/button";

const CN = "/demos/cerveau-numerique";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const isLogin = mode === "login";
  const router = useRouter();

  const goToApp = () => router.push(`${CN}/dashboard`);

  return (
    <AuthCard subtitle={isLogin ? "Bon retour 👋" : "Crée ton compte en 1 minute"}>
      <GoogleButton onClick={goToApp} />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--cn-border-soft)]" />
        <span className="text-xs text-[var(--cn-faint)]">ou par email</span>
        <span className="h-px flex-1 bg-[var(--cn-border-soft)]" />
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          goToApp();
        }}
        noValidate
      >
        {!isLogin && (
          <TextField label="Prénom" placeholder="Ton prénom" autoComplete="given-name" />
        )}
        <TextField
          label="Email"
          type="email"
          placeholder="ton@email.com"
          icon={Mail}
          autoComplete="email"
          required
        />
        <PasswordField
          label="Mot de passe"
          placeholder="••••••••"
          icon={Lock}
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
        />
        <Button type="submit" className="w-full">
          {isLogin ? "Se connecter" : "Créer un compte"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--cn-muted)]">
        {isLogin ? "Pas encore de compte ? " : "Déjà un compte ? "}
        <button
          type="button"
          onClick={() => setMode(isLogin ? "signup" : "login")}
          className="font-medium text-[var(--cn-primary)] transition-colors hover:brightness-110"
        >
          {isLogin ? "Créer un compte" : "Se connecter"}
        </button>
      </p>

      <div className="mt-6 flex items-center justify-center gap-5 text-xs text-[var(--cn-ghost)]">
        <Link href={`${CN}/legal/cgu`} className="transition-colors hover:text-[var(--cn-muted)]">
          CGU
        </Link>
        <Link href={`${CN}/legal/confidentialite`} className="transition-colors hover:text-[var(--cn-muted)]">
          Confidentialité
        </Link>
        <Link href={`${CN}/legal/dpa`} className="transition-colors hover:text-[var(--cn-muted)]">
          DPA
        </Link>
      </div>
    </AuthCard>
  );
}
