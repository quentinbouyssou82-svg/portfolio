"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/margeo/logo";
import { Button } from "@/components/margeo/ui/button";
import { Input } from "@/components/margeo/ui/input";
import { resetPasswordAction } from "@/lib/margeo/auth/password";
import { UBERLY_PATHS } from "@/lib/margeo/constants";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await resetPasswordAction(undefined, formData);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Email envoyé", {
        description: "Vérifie ta boîte mail.",
      });
    });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href={UBERLY_PATHS.home}>
          <Logo />
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-mg-foreground">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-sm text-mg-muted">
          Lien de réinitialisation par email.
        </p>
      </div>

      <form
        action={handleSubmit}
        className="space-y-4 rounded-2xl border border-mg-border bg-mg-card p-6"
      >
        <label className="block">
          <span className="text-sm font-medium text-mg-foreground">Email</span>
          <Input
            name="email"
            type="email"
            className="mt-2"
            required
            autoComplete="email"
          />
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-mg-muted">
        <Link href={UBERLY_PATHS.login} className="text-mg-accent hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
