"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/margeo/ui/button";
import { margeoRoutes } from "@/lib/margeo/routes";

/** CTA fixe mobile pour maximiser la conversion. */
export function LandingStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-mg-border bg-mg-background/90 p-3 backdrop-blur-xl lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Link href={margeoRoutes.signup}>
        <Button className="landing-cta-primary w-full min-h-12">
          Rejoindre la beta
          <ArrowRight />
        </Button>
      </Link>
    </div>
  );
}
