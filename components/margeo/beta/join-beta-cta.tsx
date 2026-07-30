"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/margeo/ui/button";
import { joinBetaAction } from "@/lib/margeo/actions/beta-mode";
import { cn } from "@/lib/margeo/utils";

type JoinBetaCtaProps = {
  className?: string;
  size?: "md" | "lg" | "sm";
  label?: string;
  /** Si true, envoie vers signup même si déjà en mode bêta */
  forceAuth?: boolean;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

/**
 * CTA « Rejoindre la bêta » — pose le cookie mode=beta puis redirige
 * (dashboard si connecté, sinon signup).
 */
export function JoinBetaCta({
  className,
  size = "lg",
  label = "Rejoindre la bêta",
  forceAuth = true,
  variant = "primary",
  fullWidth = true,
}: JoinBetaCtaProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const result = await joinBetaAction({ redirectToLogin: forceAuth });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.redirectTo) {
        router.push(result.redirectTo);
        router.refresh();
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className={cn(fullWidth && "w-full sm:w-auto", className)}>
      <Button
        type="button"
        size={size}
        variant={variant === "secondary" ? "secondary" : undefined}
        className={cn(
          variant === "primary" && "landing-cta-primary",
          fullWidth && "w-full",
          size === "lg" && "min-h-12 sm:min-w-[220px]",
        )}
        disabled={pending}
        onClick={onClick}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <>
            {label}
            <ArrowRight />
          </>
        )}
      </Button>
      {error ? (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
