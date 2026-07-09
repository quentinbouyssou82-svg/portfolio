"use client";

import { useEffect, useState } from "react";

/** Simule un chargement réseau pour rendre les skeletons visibles. */
export function useFakeLoading(durationMs = 700): boolean {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  return loading;
}
