"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { Check, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/margeo/auth/auth-field";
import { Logo } from "@/components/margeo/logo";
import { Button } from "@/components/margeo/ui/button";
import { Input } from "@/components/margeo/ui/input";
import {
  signInAction,
  signUpAction,
  type MargeoActionResult,
} from "@/lib/margeo/auth/actions";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { cn } from "@/lib/margeo/utils";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  premium = false,
}: {
  mode: Mode;
  premium?: boolean;
}) {
  const isSignup = mode === "signup";
  const authAction = isSignup ? signUpAction : signInAction;

  const [state, formAction, pending] = useActionState<
    MargeoActionResult | undefined,
    FormData
  >(authAction, undefined);

  useEffect(() => {
    if (state && !state.ok) {
      toast.error(state.message);
    }
  }, [state]);

  const cardClass = premium
    ? "auth-card app-fade-in space-y-5 rounded-[1.35rem] p-6 sm:p-8"
    : "space-y-4 rounded-2xl border border-mg-border bg-mg-card p-6";

  return (
    <div className={cn("mx-auto w-full", premium ? "max-w-[420px]" : "max-w-md")}>
      <div className={cn("text-center app-fade-in", premium ? "mb-8" : "mb-8")}>
        <Link href={UBERLY_PATHS.home} className="inline-block">
          <Logo />
        </Link>
        <h1
          className={cn(
            premium
              ? "auth-title text-gradient mt-6 text-[1.625rem] font-bold tracking-tight sm:text-3xl"
              : "mt-6 text-2xl font-bold text-mg-foreground",
          )}
        >
          {isSignup ? "Créer un compte" : "Bon retour"}
        </h1>
        <p
          className={cn(
            premium
              ? "mt-2 text-sm leading-relaxed text-mg-faint"
              : "mt-2 text-sm text-mg-muted",
          )}
        >
          {isSignup
            ? "30 secondes. Première analyse offerte."
            : "Reprends là où tu t'es arrêté."}
        </p>
        {isSignup && (
          <ul className="mt-4 space-y-2 text-left text-xs text-mg-muted">
            {[
              "Sais si ça vaut le coup avant d'accepter",
              "Gain net réel, pas le montant affiché",
              "Verdict clair en ~8 s",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-mg-go" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={cardClass}>
        {premium && <div className="auth-card-shine" aria-hidden />}

        <form action={formAction} className="relative z-[1] space-y-4">
          {isSignup && (
            premium ? (
              <AuthField
                name="name"
                label="Prénom"
                icon={User}
                placeholder="Karim"
              />
            ) : (
              <label className="block">
                <span className="text-sm font-medium text-mg-foreground">Prénom</span>
                <Input name="name" className="mt-2" placeholder="Karim" />
              </label>
            )
          )}

          {premium ? (
            <>
              <AuthField
                name="email"
                label="Email"
                icon={Mail}
                type="email"
                placeholder="livreur@email.com"
                required
                autoComplete="email"
              />
              <AuthField
                name="password"
                label="Mot de passe"
                icon={Lock}
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </>
          ) : (
            <>
              <label className="block">
                <span className="text-sm font-medium text-mg-foreground">Email</span>
                <Input
                  name="email"
                  type="email"
                  className="mt-2"
                  placeholder="livreur@email.com"
                  required
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-mg-foreground">Mot de passe</span>
                <Input
                  name="password"
                  type="password"
                  className="mt-2"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
              </label>
            </>
          )}

          {!isSignup && (
            <div className={cn("flex justify-end", premium && "-mt-1")}>
              <Link
                href={UBERLY_PATHS.forgotPassword}
                className={cn(
                  "text-xs transition-colors",
                  premium
                    ? "auth-link text-mg-muted hover:text-mg-accent"
                    : "text-mg-accent hover:underline",
                )}
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}

          {isSignup && (
            <label className="flex items-start gap-3 rounded-xl border border-mg-border bg-mg-background/40 p-3 text-left">
              <input
                type="checkbox"
                name="acceptTerms"
                value="1"
                required
                className="mt-0.5 size-4 shrink-0 rounded border-mg-border accent-[var(--color-mg-accent)]"
              />
              <span className="text-xs leading-relaxed text-mg-muted">
                J&apos;ai lu et j&apos;accepte les{" "}
                <Link
                  href={UBERLY_PATHS.cgu}
                  target="_blank"
                  className="font-medium text-mg-accent underline-offset-2 hover:underline"
                >
                  Conditions Générales d&apos;Utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href={UBERLY_PATHS.confidentialite}
                  target="_blank"
                  className="font-medium text-mg-accent underline-offset-2 hover:underline"
                >
                  Politique de confidentialité
                </Link>
                .
              </span>
            </label>
          )}

          <Button
            type="submit"
            size="lg"
            className={cn("w-full", premium && "auth-submit-btn")}
            loading={pending}
          >
            {pending
              ? "Un instant…"
              : isSignup
                ? "Créer mon compte"
                : "Se connecter"}
          </Button>
        </form>
      </div>

      <p
        className={cn(
          "text-center text-sm app-fade-in",
          premium ? "auth-footer-link mt-7 text-mg-faint" : "mt-6 text-mg-muted",
        )}
      >
        {isSignup ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <Link
          href={isSignup ? UBERLY_PATHS.login : UBERLY_PATHS.signup}
          className={cn(
            premium
              ? "auth-link font-medium text-mg-accent/90 hover:text-mg-accent"
              : "font-medium text-mg-accent hover:underline",
          )}
        >
          {isSignup ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  );
}
