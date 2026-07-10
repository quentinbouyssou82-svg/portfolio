"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/margeo/auth/auth-field";
import { GoogleIcon } from "@/components/margeo/auth/google-icon";
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
import { cn } from "@/lib/margeo/utils";

type Mode = "login" | "signup";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 28 };

export function AuthForm({
  mode,
  premium = false,
}: {
  mode: Mode;
  premium?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
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

  const cardClass = premium
    ? "auth-card space-y-5 rounded-[1.35rem] p-7 sm:p-8"
    : "space-y-4 rounded-2xl border border-mg-border bg-mg-card p-6";

  const CardWrapper = premium ? motion.div : "div";
  const cardProps = premium
    ? {
        initial: reduceMotion ? false : { opacity: 0, y: 20, filter: "blur(10px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: { ...SPRING, delay: 0.08 },
      }
    : {};

  return (
    <div className={cn("mx-auto w-full", premium ? "max-w-[420px]" : "max-w-md")}>
      <motion.div
        initial={premium && !reduceMotion ? { opacity: 0, y: 14, filter: "blur(8px)" } : false}
        animate={premium ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
        transition={{ ...SPRING }}
        className={cn("text-center", premium ? "mb-9" : "mb-8")}
      >
        <Link href={UBERLY_PATHS.home} className="inline-block">
          <Logo />
        </Link>
        <h1
          className={cn(
            premium
              ? "auth-title text-gradient mt-7 text-[1.75rem] font-bold tracking-tight sm:text-3xl"
              : "mt-6 text-2xl font-bold text-mg-foreground",
          )}
        >
          {isSignup ? "Créer un compte" : "Connexion"}
        </h1>
        <p
          className={cn(
            premium
              ? "mt-2.5 text-sm leading-relaxed text-mg-faint"
              : "mt-2 text-sm text-mg-muted",
          )}
        >
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
      </motion.div>

      <CardWrapper className={cardClass} {...cardProps}>
        {premium && <div className="auth-card-shine" aria-hidden />}

        {premium ? (
          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={pending}
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={SPRING}
            className="auth-google-btn relative z-[1] flex w-full min-h-12 items-center justify-center gap-3 rounded-xl px-4 text-sm font-medium text-mg-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GoogleIcon className="size-5 shrink-0" />
            <span>Continuer avec Google</span>
          </motion.button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="w-full min-h-11"
            onClick={handleGoogle}
            disabled={pending}
          >
            Continuer avec Google
          </Button>
        )}

        <div className={cn("relative", premium ? "py-0.5" : "py-1")}>
          <div className="absolute inset-0 flex items-center">
            <span className={cn("w-full border-t", premium ? "border-white/[0.08]" : "border-mg-border")} />
          </div>
          <p
            className={cn(
              "relative mx-auto w-fit px-3 text-xs tracking-wide",
              premium ? "auth-divider-label text-mg-faint" : "bg-mg-card text-mg-faint",
            )}
          >
            ou email
          </p>
        </div>

        <form action={handleSubmit} className="relative z-[1] space-y-4">
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

          {premium ? (
            <motion.button
              type="submit"
              disabled={pending}
              whileHover={pending || reduceMotion ? undefined : { scale: 1.01 }}
              whileTap={pending || reduceMotion ? undefined : { scale: 0.98 }}
              transition={SPRING}
              className="auth-submit-btn flex w-full min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
            >
              {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {pending
                ? "Chargement…"
                : isSignup
                  ? "Créer mon compte"
                  : "Se connecter"}
            </motion.button>
          ) : (
            <Button type="submit" className="w-full min-h-11" disabled={pending}>
              {pending
                ? "Chargement…"
                : isSignup
                  ? "Créer mon compte"
                  : "Se connecter"}
            </Button>
          )}
        </form>
      </CardWrapper>

      <motion.p
        initial={premium && !reduceMotion ? { opacity: 0 } : false}
        animate={premium ? { opacity: 1 } : undefined}
        transition={{ ...SPRING, delay: 0.14 }}
        className={cn(
          "text-center text-sm",
          premium ? "auth-footer-link mt-8 text-mg-faint" : "mt-6 text-mg-muted",
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
      </motion.p>
    </div>
  );
}
