"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Home, Key, Lock, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import {
  joinAsNewMemberAction,
  loginMemberAction,
  lookupHouseholdAction,
} from "@/lib/maison/auth/actions";
import { MAISON_PATHS } from "@/lib/maison/constants";

type Mode = "choose" | "join" | "join-login" | "join-new";

type Props = {
  configured: boolean;
  missingVars?: string[];
};

export function MaisonHouseholdForm({ configured, missingVars = [] }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPin, setShowPin] = useState(false);

  const [householdKey, setHouseholdKey] = useState("");
  const [pin, setPin] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [members, setMembers] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [newMemberName, setNewMemberName] = useState("");

  function guardConfigured(): boolean {
    if (configured) return true;
    setMessage(
      missingVars.length > 0
        ? `Manquant : ${missingVars.join(", ")}`
        : "Supabase non configuré (SUPABASE_SERVICE_ROLE_KEY requis)",
    );
    return false;
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!guardConfigured()) return;
    setMessage(null);

    startTransition(async () => {
      const result = await lookupHouseholdAction(householdKey);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setLookupName(result.data!.householdName);
      setMembers(result.data!.members);
      setMode("join-login");
    });
  }

  function handleMemberLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMemberId) {
      setMessage("Choisissez votre profil.");
      return;
    }
    const fd = new FormData();
    fd.set("householdKey", householdKey);
    fd.set("memberId", selectedMemberId);
    fd.set("pin", pin);

    startTransition(async () => {
      const result = await loginMemberAction(fd);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.push(MAISON_PATHS.home);
      router.refresh();
    });
  }

  function handleNewMember(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("householdKey", householdKey);
    fd.set("name", newMemberName);
    fd.set("pin", pin);

    startTransition(async () => {
      const result = await joinAsNewMemberAction(fd);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.push(MAISON_PATHS.home);
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-rise">
        <div className="text-center mb-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sage mb-3">
            Maison
          </p>
          <h1 className="font-serif text-5xl text-ink leading-none">Votre foyer.</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-[32ch] mx-auto text-pretty">
            {mode === "choose" && "Pas de compte email. Juste votre foyer et un code PIN."}
            {mode === "join" && "Entrez la clé reçue de l'administrateur."}
            {mode === "join-login" && `Bienvenue dans ${lookupName}.`}
            {mode === "join-new" && "Créez votre profil dans ce foyer."}
          </p>
        </div>

        <div className="rounded-3xl bg-paper ring-1 ring-black/[0.04] p-6 sm:p-8">
          {mode === "choose" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (!guardConfigured()) return;
                  router.push(MAISON_PATHS.onboarding);
                }}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-ink text-cream text-left"
              >
                <Home className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Créer un foyer</p>
                  <p className="text-xs text-cream/60 mt-0.5">Je suis l&apos;administrateur</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode("join")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-paper ring-1 ring-black/[0.06] text-left hover:ring-black/15 transition-all"
              >
                <Key className="h-5 w-5 shrink-0 text-sage" />
                <div>
                  <p className="text-sm font-medium">Rejoindre un foyer</p>
                  <p className="text-xs text-ash mt-0.5">J&apos;ai une clé (ex: FAM-8K2X9Q)</p>
                </div>
              </button>
            </div>
          )}

          {mode === "join" && (
            <form onSubmit={handleLookup} className="space-y-4">
              <Field
                label="Clé du foyer"
                value={householdKey}
                onChange={(v) => setHouseholdKey(v.toUpperCase())}
                placeholder="FAM-8K2X9Q"
              />
              <SubmitButton pending={pending} label="Continuer" />
              <BackButton onClick={() => setMode("choose")} />
            </form>
          )}

          {mode === "join-login" && (
            <div className="space-y-4">
              <p className="text-xs text-ash">Qui êtes-vous ?</p>
              <div className="grid grid-cols-2 gap-2">
                {members.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMemberId(m.id)}
                    className={`p-4 rounded-2xl ring-1 text-left text-sm transition-all ${
                      selectedMemberId === m.id
                        ? "bg-ink text-cream ring-ink"
                        : "bg-cream ring-black/[0.05] hover:ring-black/15"
                    }`}
                  >
                    <span className="font-medium">{m.name}</span>
                    {m.role === "admin" ? (
                      <span className="block text-[10px] opacity-60 mt-0.5">Admin</span>
                    ) : null}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMode("join-new")}
                  className="p-4 rounded-2xl border border-dashed border-border text-ash text-sm flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  Nouveau
                </button>
              </div>
              <form onSubmit={handleMemberLogin} className="space-y-4">
                <PinField pin={pin} showPin={showPin} onPinChange={setPin} onToggle={() => setShowPin((v) => !v)} />
                <SubmitButton pending={pending} label="Entrer" />
              </form>
              <BackButton onClick={() => setMode("join")} />
            </div>
          )}

          {mode === "join-new" && (
            <form onSubmit={handleNewMember} className="space-y-4">
              <Field label="Votre prénom" value={newMemberName} onChange={setNewMemberName} placeholder="Marie" />
              <PinField pin={pin} showPin={showPin} onPinChange={setPin} onToggle={() => setShowPin((v) => !v)} />
              <SubmitButton pending={pending} label="Créer mon profil" />
              <BackButton onClick={() => setMode("join-login")} />
            </form>
          )}

          {message ? <p className="text-xs text-center text-destructive mt-4">{message}</p> : null}
        </div>

        <p className="mt-8 text-center">
          <Link href="/demos" className="text-xs text-ash hover:text-ink/70">
            ← Retour aux démos
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink/70">{label}</label>
      <input
        className="maison-input mt-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

function PinField({
  pin,
  showPin,
  onPinChange,
  onToggle,
}: {
  pin: string;
  showPin: boolean;
  onPinChange: (v: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink/70">Code PIN (4 chiffres min.)</label>
      <div className="relative mt-1.5">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
        <input
          type={showPin ? "text" : "password"}
          inputMode="numeric"
          className="maison-input pl-10 pr-10"
          value={pin}
          onChange={(e) => onPinChange(e.target.value)}
          placeholder="••••"
          minLength={4}
          required
        />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-ash">
          {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button type="submit" disabled={pending} className="maison-btn maison-btn-primary maison-btn-block py-3.5">
      {pending ? <span className="maison-spinner" /> : label}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-center text-xs text-ash hover:text-ink/70">
      ← Retour
    </button>
  );
}
