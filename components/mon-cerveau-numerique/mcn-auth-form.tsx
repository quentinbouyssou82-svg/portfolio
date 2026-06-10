"use client";

import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { McnLogo } from "@/components/mon-cerveau-numerique/mcn-logo";
import { McnButton } from "@/components/mon-cerveau-numerique/ui/button";
import { McnCard, McnCardContent } from "@/components/mon-cerveau-numerique/ui/card";
import { McnInput } from "@/components/mon-cerveau-numerique/ui/input";
import { McnLabel } from "@/components/mon-cerveau-numerique/ui/label";
import { McnSeparator } from "@/components/mon-cerveau-numerique/ui/separator";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";

export function McnAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(mode === "signup" ? MCN_PATHS.onboarding : MCN_PATHS.dashboard);
  }

  function handleGoogle() {
    router.push(MCN_PATHS.dashboard);
  }

  return (
    <div className="mx-auto w-full max-w-[400px] px-4 py-16 sm:py-20">
      <McnCard className="mcn-animate-in border-[var(--mcn-border-strong)] shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
        <McnCardContent className="p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <McnLogo size={18} className="mb-4" />
            <h1 className="text-lg font-semibold tracking-tight">Mon Cerveau Numérique</h1>
            <p className="mt-1 text-sm text-[var(--mcn-fg-muted)]">
              {mode === "login" ? "Bon retour 👋" : "Crée ton compte"}
            </p>
          </div>

          <McnButton
            type="button"
            variant="outline"
            className="mb-5 w-full"
            onClick={handleGoogle}
          >
            <GoogleIcon />
            Continuer avec Google
          </McnButton>

          <div className="relative mb-5">
            <McnSeparator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--mcn-bg-elevated)] px-2 text-[10px] uppercase tracking-wider text-[var(--mcn-fg-subtle)]">
              ou par email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <McnLabel htmlFor="mcn-email">Email</McnLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--mcn-fg-subtle)]" />
                <McnInput
                  id="mcn-email"
                  type="email"
                  className="pl-9"
                  placeholder="ton@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <McnLabel htmlFor="mcn-password">Mot de passe</McnLabel>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--mcn-fg-subtle)]" />
                <McnInput
                  id="mcn-password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <McnButton type="submit" className="w-full" size="lg">
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </McnButton>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--mcn-fg-muted)]">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-medium text-[var(--mcn-accent)] transition-colors hover:text-[var(--mcn-accent-hover)]"
            >
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>

          <p className="mt-4 text-center">
            <Link
              href={MCN_PATHS.home}
              className="text-xs text-[var(--mcn-fg-subtle)] transition-colors hover:text-[var(--mcn-fg-muted)]"
            >
              ← Retour à l&apos;accueil
            </Link>
          </p>
        </McnCardContent>
      </McnCard>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
