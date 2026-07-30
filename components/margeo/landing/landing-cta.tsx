import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { JoinBetaCta } from "@/components/margeo/beta/join-beta-cta";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

interface LandingCtaProps {
  className?: string;
  size?: "md" | "lg";
  primaryOnly?: boolean;
}

/** Landing → Rejoindre la bêta (cookie) → auth si besoin. */
export function LandingCta({
  className,
  size = "lg",
  primaryOnly = false,
}: LandingCtaProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      <JoinBetaCta size={size} />
      {!primaryOnly && (
        <Link href={margeoRoutes.login} className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size={size}
            className="w-full min-h-12 sm:min-w-[200px]"
          >
            Se connecter
            <ArrowRight className="opacity-0 size-0" aria-hidden />
          </Button>
        </Link>
      )}
    </div>
  );
}
