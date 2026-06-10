"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signInWithPin } from "@/lib/control-tower/actions";

const DASHBOARD_PATH = "/control-tower/dashboard";

type LoginFormProps = {
  configured: boolean;
  missingVars?: string[];
};

export function LoginForm({ configured, missingVars = [] }: LoginFormProps) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setMessage(
        missingVars.length > 0
          ? `Variables manquantes : ${missingVars.join(", ")}. Redémarre npm run dev après .env.local.`
          : "Configuration incomplète — vérifie .env.local et redémarre le serveur.",
      );
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await signInWithPin(pin);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.info("[control-tower] REDIRECTING →", DASHBOARD_PATH);
      }

      router.push(DASHBOARD_PATH);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="ct-pin" className="ct-label">
        Code PIN
      </label>
      <input
        id="ct-pin"
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        className="ct-input ct-input-pin"
        placeholder="••••"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        disabled={pending}
        maxLength={12}
      />
      <button
        type="submit"
        className="ct-btn ct-btn-primary ct-btn-block"
        disabled={pending || !pin}
      >
        {pending ? "…" : "Entrer"}
      </button>
      {message ? (
        <p className="ct-form-hint ct-form-hint-error">{message}</p>
      ) : null}
      {!configured && missingVars.length > 0 ? (
        <p className="ct-form-hint ct-form-hint-muted">
          Manquant : {missingVars.join(" · ")}
        </p>
      ) : null}
    </form>
  );
}
