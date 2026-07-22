"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
const HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com";

let initialized = false;

function initPostHog() {
  if (initialized || typeof window === "undefined" || !KEY) return;
  posthog.init(KEY, {
    api_host: HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
  });
  initialized = true;
}

export function DriveelyPostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPostHog();
  }, []);

  if (!KEY) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/** @deprecated */
export const MargeoPostHogProvider = DriveelyPostHogProvider;

export { posthog };
