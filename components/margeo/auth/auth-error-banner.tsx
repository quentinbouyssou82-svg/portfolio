"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function AuthErrorBanner({ message }: { message?: string }) {
  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);

  return null;
}
