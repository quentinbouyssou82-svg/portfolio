"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/margeo/logo";
import { Button } from "@/components/margeo/ui/button";
import { Input } from "@/components/margeo/ui/input";
import {
  signInAction,
  signUpAction,
} from "@/lib/margeo/auth/actions";
import { signInWithGoogleAction } from "@/lib/margeo/auth/oauth";
import { UBERLY_PATHS } from "@/lib/margeo/constants";
import { trackMargeoEvent } from "@/lib/margeo/analytics";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isSignup = mode === "signup";

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = isSignup
        ? await signUpAction(formData)
        : await signInAction(formData);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      if (isSignup) {
        trackMargeoEvent("margeo_account_created");
        toast.success("Compte créé !", {
          description: "Configure ton profil pour commencer.",
        });
        router.push(UBERLY_PATHS.onboarding);
      } else {
        router.push(UBERLY_PATHS.dashboard);
      }
      router.refresh();
    });
  };

  const handleGoogle = () => {
    startTransition(async () => {
      try {
        await signInWithGoogleAction();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Connexion Google impossible");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href={UBERLY_PATHS.home} className="inline-block">
          <Logo />
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-mg-foreground">
          {isSignup ? "Créer un compte" : "Connexion"}
        </h1>
        <p className="mt-2 text-sm text-mg-muted">
          {isSignup
            ? "Crée ton compte en 30 secondes. Première analyse gratuite."
            : "Retrouve ton historique et tes analyses."}
        </p>
        {isSignup && (
          <ul className="mt-4 space-y-2 text-left text-xs text-mg-muted">
            {[
              "Sais si une course vaut le coup avant d'accepter",
              "Gain net réel, pas le montant affiché par l'app",
              "Verdict clair : accepter, vérifier ou refuser",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-mg-go" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-mg-border bg-mg-card p-6">
        <Button
          type="button"
          variant="secondary"
          className="w-full min-h-11"
          onClick={handleGoogle}
          disabled={pending}
        >
          Continuer avec Google
        </Button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-mg-border" />
          </div>
          <p className="relative mx-auto w-fit bg-mg-card px-3 text-xs text-mg-faint">
            ou email
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          {isSignup && (
            <label className="block">
              <span className="text-sm font-medium text-mg-foreground">Prénom</span>
              <Input name="name" className="mt-2" placeholder="Karim" />
            </label>
          )}
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
          {!isSignup && (
            <div className="text-right">
              <Link
                href={UBERLY_PATHS.forgotPassword}
                className="text-xs text-mg-accent hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}
          <Button type="submit" className="w-full min-h-11" disabled={pending}>
            {pending
              ? "Chargement…"
              : isSignup
                ? "Créer mon compte"
                : "Se connecter"}
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-mg-muted">
        {isSignup ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <Link
          href={isSignup ? UBERLY_PATHS.login : UBERLY_PATHS.signup}
          className="font-medium text-mg-accent hover:underline"
        >
          {isSignup ? "Se connecter" : "Créer un compte"}
        </Link>
      </p>
    </div>
  );
}
