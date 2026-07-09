"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GroceryProviderStep } from "@/components/maison/onboarding/grocery-provider-step";
import { MAISON_PATHS } from "@/lib/maison/constants";
import type { GroceryProviderId } from "@/lib/maison/grocery-providers/config";
import { connectGroceryProviderAction } from "@/lib/maison/onboarding-actions";
import type { GroceryIntegration } from "@/lib/maison/types";

type Props = {
  initialIntegration: GroceryIntegration | null;
};

export function ConnexionCoursesClient({ initialIntegration }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [integration, setIntegration] = useState(initialIntegration);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get("oauth_error");
    if (oauthError) setError(oauthError);
    if (searchParams.get("oauth") === "success") {
      router.push(MAISON_PATHS.home);
      router.refresh();
    }
  }, [searchParams, router]);

  async function handleConnect(
    provider: GroceryProviderId,
    mode: "mock" | "manual",
    storeId?: string,
  ) {
    setError(null);
    const res = await connectGroceryProviderAction(provider, mode, storeId);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    if (res.data) setIntegration(res.data);
    router.push(MAISON_PATHS.home);
    router.refresh();
  }

  return (
    <div>
      <GroceryProviderStep integration={integration} onConnect={handleConnect} />
      {error ? <p className="text-xs text-center text-destructive mt-3">{error}</p> : null}
    </div>
  );
}
