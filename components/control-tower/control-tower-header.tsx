"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signOutAction } from "@/lib/control-tower/actions";

export function ControlTowerHeader() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      await signOutAction();
      router.push("/control-tower/login");
      router.refresh();
    });
  }

  return (
    <header className="ct-header">
      <div>
        <p className="ct-logo">
          Personal <strong>Control Tower</strong>
        </p>
        <p className="ct-header-email">Session active</p>
      </div>
      <button
        type="button"
        className="ct-btn ct-btn-ghost"
        onClick={signOut}
        disabled={pending}
      >
        {pending ? "…" : "Déconnexion"}
      </button>
    </header>
  );
}
