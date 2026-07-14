import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";
import { cn } from "@/lib/margeo/utils";

interface LandingCtaProps {
  className?: string;
  size?: "md" | "lg";
  primaryOnly?: boolean;
}

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
      <Link href={margeoRoutes.signup} className="w-full sm:w-auto">
        <Button
          size={size}
          className="landing-cta-primary w-full min-h-12 sm:min-w-[220px]"
        >
          Commencer gratuitement
          <ArrowRight />
        </Button>
      </Link>
      {!primaryOnly && (
        <Link href={margeoRoutes.signup} className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size={size}
            className="w-full min-h-12 sm:min-w-[200px]"
          >
            Créer mon compte
          </Button>
        </Link>
      )}
    </div>
  );
}
