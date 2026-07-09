"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Lock,
  Plus,
  QrCode,
  Trash2,
  UserPlus,
} from "lucide-react";
import { AllergiesStep } from "@/components/maison/onboarding/allergies-step";
import { DietRegimeStep } from "@/components/maison/onboarding/diet-regime-step";
import { FoodRatingGrid } from "@/components/maison/onboarding/food-rating-grid";
import { HabitsStep } from "@/components/maison/onboarding/habits-step";
import { GroceryProviderStep } from "@/components/maison/onboarding/grocery-provider-step";
import { MemberPicker } from "@/components/maison/onboarding/member-picker";
import { MaisonSignOutButton } from "@/components/maison/maison-sign-out-button";
import { createHouseholdAction } from "@/lib/maison/auth/actions";
import { emptyMemberFoodProfile } from "@/lib/maison/foods/sync";
import {
  categoriesForDiet,
  defaultCategoryForDiet,
} from "@/lib/maison/foods/diet-categories";
import type { FoodCategory, MemberFoodProfile } from "@/lib/maison/foods/types";
import {
  addOnboardingMemberAction,
  completeOnboardingAction,
  connectGroceryProviderAction,
  deleteOnboardingMemberAction,
  getMemberFoodProfileAction,
  listOnboardingMembersAction,
  saveMemberFoodProfileAction,
  updateOnboardingMemberAction,
} from "@/lib/maison/onboarding-actions";
import { MAISON_PATHS } from "@/lib/maison/constants";
import type { GroceryIntegration, MemberRole } from "@/lib/maison/types";
import { isGroceryProviderConnected } from "@/lib/maison/grocery-providers";

export type OnboardingMember = {
  id: string;
  name: string;
  role: MemberRole;
  age: number | null;
};

export type OnboardingInitial = {
  householdName: string;
  householdKey: string;
  members: OnboardingMember[];
  groceryProvider?: GroceryIntegration | null;
  /** @deprecated */
  leclerc?: GroceryIntegration | null;
};

type WizardStep = "foyer" | "members" | "regime" | "diet" | "allergies" | "habits" | "leclerc";

const STEP_ORDER: WizardStep[] = [
  "foyer",
  "members",
  "regime",
  "diet",
  "allergies",
  "habits",
  "leclerc",
];

const STEP_META: Record<WizardStep, { eyebrow: string; title: string; sub: string }> = {
  foyer: {
    eyebrow: "Foyer",
    title: "Créer votre foyer",
    sub: "Nommez votre foyer et définissez le PIN administrateur.",
  },
  members: {
    eyebrow: "Membres",
    title: "Membres du foyer",
    sub: "Ajoutez autant de membres que nécessaire.",
  },
  regime: {
    eyebrow: "Étape 1/5",
    title: "Régime alimentaire",
    sub: "Définissez le régime de chaque membre avant de noter les aliments.",
  },
  diet: {
    eyebrow: "Étape 2/5",
    title: "Vos aliments préférés",
    sub: "Indiquez ce que vous aimez ou souhaitez éviter.",
  },
  allergies: {
    eyebrow: "Étape 3/5",
    title: "Allergies & restrictions",
    sub: "Sécurité alimentaire pour toute la famille.",
  },
  habits: {
    eyebrow: "Étape 4/5",
    title: "Habitudes",
    sub: "Créneaux de repas préférés.",
  },
  leclerc: {
    eyebrow: "Étape 5/5",
    title: "Connecter votre supermarché",
    sub: "Leclerc Drive, Netto ou autre enseigne.",
  },
};

type Props = {
  initial: OnboardingInitial | null;
  configured: boolean;
  missingVars?: string[];
  groceryOptional?: boolean;
};

type DraftMember = { name: string; age: string; role: MemberRole; pin: string };

const emptyDraft = (): DraftMember => ({ name: "", age: "", role: "member", pin: "" });

function mapMembersFromServer(
  list: Array<{ id: string; name: string; role: MemberRole; goals: string | null }>,
): OnboardingMember[] {
  return list.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    age: m.goals?.match(/^(\d+)\s*ans$/) ? parseInt(m.goals.match(/^(\d+)\s*ans$/)![1], 10) : null,
  }));
}

export function MaisonOnboardingWizard({
  initial,
  configured,
  missingVars = [],
  groceryOptional = false,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(initial ? "members" : "foyer");
  const [householdName, setHouseholdName] = useState(initial?.householdName ?? "");
  const [householdKey, setHouseholdKey] = useState(initial?.householdKey ?? "");
  const [members, setMembers] = useState<OnboardingMember[]>(initial?.members ?? []);
  const [adminPin, setAdminPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [draft, setDraft] = useState<DraftMember>(emptyDraft);
  const [showAddForm, setShowAddForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [activeMemberId, setActiveMemberId] = useState<string>("");
  const [profiles, setProfiles] = useState<Record<string, MemberFoodProfile>>({});
  const [activeCategory, setActiveCategory] = useState<FoodCategory>("legumes");
  const [groceryProvider, setGroceryProvider] = useState<GroceryIntegration | null>(
    initial?.groceryProvider ?? initial?.leclerc ?? null,
  );
  const [prefsSaved, setPrefsSaved] = useState<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!initial) return;
    setHouseholdName(initial.householdName);
    setHouseholdKey(initial.householdKey);
    setMembers(initial.members);
    setGroceryProvider(initial.groceryProvider ?? initial.leclerc ?? null);
    if (initial.members.length) setActiveMemberId(initial.members[0].id);
    setStep("members");
  }, [initial]);

  useEffect(() => {
    if (!activeMemberId || profiles[activeMemberId]) return;
    void getMemberFoodProfileAction(activeMemberId).then((res) => {
      if (res.ok && res.data) {
        setProfiles((p) => ({ ...p, [activeMemberId]: res.data! }));
      } else {
        setProfiles((p) => ({ ...p, [activeMemberId]: emptyMemberFoodProfile() }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- charge une fois par membre
  }, [activeMemberId]);

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = ((stepIndex + 1) / STEP_ORDER.length) * 100;
  const meta = STEP_META[step];
  const activeProfile = profiles[activeMemberId] ?? emptyMemberFoodProfile();

  const handleSelectMember = useCallback(
    (memberId: string) => {
      setActiveMemberId(memberId);
      const profile = profiles[memberId];
      if (profile) {
        setActiveCategory(defaultCategoryForDiet(profile.dietType));
      }
    },
    [profiles],
  );

  const guardConfigured = useCallback((): boolean => {
    if (configured) return true;
    setError(
      missingVars.length > 0
        ? `Manquant : ${missingVars.join(", ")}`
        : "Supabase non configuré",
    );
    return false;
  }, [configured, missingVars]);

  const persistProfile = useCallback(
    (memberId: string, profile: MemberFoodProfile, immediate = false) => {
      setProfiles((p) => ({ ...p, [memberId]: profile }));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const run = () => {
        void saveMemberFoodProfileAction(memberId, profile).then((res) => {
          if (!res.ok) setError(res.message);
          else setPrefsSaved((s) => new Set(s).add(memberId));
        });
      };
      if (immediate) run();
      else saveTimer.current = setTimeout(run, 400);
    },
    [],
  );

  const patchProfile = useCallback(
    (patch: Partial<MemberFoodProfile>, immediate = false) => {
      if (!activeMemberId) return;
      const next = { ...activeProfile, ...patch };
      persistProfile(activeMemberId, next, immediate);
    },
    [activeMemberId, activeProfile, persistProfile],
  );

  function handleCreateFoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!guardConfigured()) return;
    setError(null);
    const fd = new FormData();
    fd.set("householdName", householdName);
    fd.set("pin", adminPin);

    startTransition(async () => {
      const result = await createHouseholdAction(fd);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setHouseholdKey(result.data?.householdKey ?? "");
      const list = await listOnboardingMembersAction();
      if (list.ok && list.data) {
        const mapped = mapMembersFromServer(list.data);
        setMembers(mapped);
        if (mapped[0]) setActiveMemberId(mapped[0].id);
      }
      setStep("members");
      router.refresh();
    });
  }

  function goBack() {
    const idx = stepIndex;
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  }

  function goNext() {
    if (step === "members") {
      if (members.length === 0) {
        setError("Ajoutez au moins un membre.");
        return;
      }
      if (!activeMemberId && members[0]) setActiveMemberId(members[0].id);
      setStep("regime");
      return;
    }

    if (step === "regime" || step === "diet" || step === "habits") {
      persistProfile(activeMemberId, activeProfile, true);
    }

    if (step === "allergies") {
      persistProfile(activeMemberId, activeProfile, true);
    }

    if (step === "habits") {
      setStep("leclerc");
      return;
    }

    if (step === "leclerc") {
      handleFinish();
      return;
    }

    setStep(STEP_ORDER[stepIndex + 1]);
  }

  function handleFinish() {
    setError(null);
    startTransition(async () => {
      for (const member of members) {
        const profile = profiles[member.id];
        if (!profile) continue;
        const saved = await saveMemberFoodProfileAction(member.id, profile);
        if (!saved.ok) {
          setError(saved.message);
          return;
        }
      }

      const result = await completeOnboardingAction();
      if (!result.ok) {
        setError(result.message);
        return;
      }

      if (result.data?.warning) {
        try {
          sessionStorage.setItem("maison_onboarding_warning", result.data.warning);
        } catch {
          /* ignore */
        }
      }

      router.push(MAISON_PATHS.home);
      router.refresh();
    });
  }

  function copyKey() {
    if (!householdKey) return;
    void navigator.clipboard.writeText(householdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isPrefStep =
    step === "regime" || step === "diet" || step === "allergies" || step === "habits";

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-6 pt-8 pb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={step === "foyer" || pending}
            className="size-9 rounded-full bg-paper ring-1 ring-black/[0.04] grid place-items-center disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1 h-1 bg-black/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-sage transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-ash tabular-nums w-10 text-right">
            {stepIndex + 1}/{STEP_ORDER.length}
          </span>
        </div>

        <div key={step} className="flex-1 flex flex-col py-6 animate-rise min-h-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sage mb-2">
            {meta.eyebrow}
          </p>
          <h1 className="font-serif text-[32px] leading-[1.05] text-balance">{meta.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">{meta.sub}</p>

          {isPrefStep && members.length > 0 ? (
            <div className="mt-4">
              <MemberPicker
                members={members}
                activeId={activeMemberId}
                onSelect={handleSelectMember}
                configuredIds={prefsSaved}
              />
            </div>
          ) : null}

          <div className="mt-5 flex-1 overflow-y-auto min-h-0 -mx-1 px-1 pb-2">
            {step === "foyer" && (
              <form onSubmit={handleCreateFoyer} className="space-y-4">
                <Field label="Nom du foyer" value={householdName} onChange={setHouseholdName} placeholder="Famille Martin" required />
                <PinField label="PIN administrateur" pin={adminPin} showPin={showPin} onPinChange={setAdminPin} onToggle={() => setShowPin((v) => !v)} />
                <button type="submit" disabled={pending || !householdName.trim() || adminPin.length < 4} className="w-full bg-ink text-cream py-4 rounded-2xl text-sm font-medium disabled:opacity-50 mt-2">
                  {pending ? <span className="maison-spinner" /> : "Créer le foyer"}
                </button>
              </form>
            )}

            {step === "members" && (
              <MembersPanel
                members={members}
                householdKey={householdKey}
                copied={copied}
                onCopyKey={copyKey}
                draft={draft}
                setDraft={setDraft}
                showAddForm={showAddForm}
                setShowAddForm={setShowAddForm}
                pending={pending}
                onAdd={(e) => {
                  e.preventDefault();
                  const age = draft.age.trim() ? parseInt(draft.age, 10) : null;
                  startTransition(async () => {
                    const result = await addOnboardingMemberAction({
                      name: draft.name,
                      pin: draft.pin,
                      role: draft.role,
                      age: Number.isFinite(age) ? age : null,
                    });
                    if (!result.ok) { setError(result.message); return; }
                    setMembers((prev) => [...prev, { id: result.data!.id, name: draft.name.trim(), role: draft.role, age: Number.isFinite(age) ? age : null }]);
                    setDraft(emptyDraft());
                    setShowAddForm(false);
                    router.refresh();
                  });
                }}
                onUpdate={(id, patch, pin) => {
                  setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
                  startTransition(async () => {
                    const result = await updateOnboardingMemberAction(id, { ...patch, pin });
                    if (!result.ok) setError(result.message);
                  });
                }}
                onDelete={(id) => {
                  startTransition(async () => {
                    const result = await deleteOnboardingMemberAction(id);
                    if (!result.ok) { setError(result.message); return; }
                    setMembers((prev) => prev.filter((m) => m.id !== id));
                    router.refresh();
                  });
                }}
              />
            )}

            {step === "regime" && (
              <DietRegimeStep
                value={activeProfile.dietType}
                onChange={(dietType) => {
                  patchProfile({ dietType }, true);
                  const allowed = categoriesForDiet(dietType);
                  if (!allowed.includes(activeCategory)) {
                    setActiveCategory(defaultCategoryForDiet(dietType));
                  }
                }}
                disabled={pending}
              />
            )}

            {step === "diet" && (
              <FoodRatingGrid
                dietType={activeProfile.dietType}
                foodRatings={activeProfile.foodRatings}
                consumptionHabits={activeProfile.consumptionHabits}
                dislikeLevels={activeProfile.dislikeLevels}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                onRatingChange={(foodId, rating) => {
                  const habits = { ...activeProfile.consumptionHabits };
                  const levels = { ...activeProfile.dislikeLevels };
                  if (rating === "like") {
                    if (!habits[foodId]) habits[foodId] = "sometimes";
                    delete levels[foodId];
                  } else if (rating === "dislike") {
                    delete habits[foodId];
                    if (!levels[foodId]) levels[foodId] = "sometimes";
                  } else {
                    delete habits[foodId];
                    delete levels[foodId];
                  }
                  patchProfile({
                    foodRatings: { ...activeProfile.foodRatings, [foodId]: rating },
                    consumptionHabits: habits,
                    dislikeLevels: levels,
                  });
                }}
                onFrequencyChange={(foodId, freq) =>
                  patchProfile({
                    consumptionHabits: { ...activeProfile.consumptionHabits, [foodId]: freq },
                    foodRatings: { ...activeProfile.foodRatings, [foodId]: "like" },
                    dislikeLevels: Object.fromEntries(
                      Object.entries(activeProfile.dislikeLevels).filter(([id]) => id !== foodId),
                    ),
                  }, true)
                }
                onDislikeLevelChange={(foodId, level) =>
                  patchProfile({
                    dislikeLevels: { ...activeProfile.dislikeLevels, [foodId]: level },
                    foodRatings: { ...activeProfile.foodRatings, [foodId]: "dislike" },
                    consumptionHabits: Object.fromEntries(
                      Object.entries(activeProfile.consumptionHabits).filter(([id]) => id !== foodId),
                    ),
                  }, true)
                }
                disabled={pending}
              />
            )}

            {step === "allergies" && (
              <AllergiesStep
                allergies={activeProfile.allergies}
                forbiddenFoods={activeProfile.forbiddenFoods}
                intolerances={activeProfile.intolerances}
                onChange={(patch) => patchProfile(patch, true)}
                disabled={pending}
              />
            )}

            {step === "habits" && (
              <HabitsStep
                preferredMeals={activeProfile.preferredMeals}
                onPreferredMealsChange={(meals) => patchProfile({ preferredMeals: meals }, true)}
                disabled={pending}
              />
            )}

            {step === "leclerc" && (
              <GroceryProviderStep
                integration={groceryProvider}
                onConnect={async (provider, mode, storeId) => {
                  const res = await connectGroceryProviderAction(provider, mode, storeId);
                  if (!res.ok) setError(res.message);
                  else if (res.data) setGroceryProvider(res.data);
                }}
                disabled={pending}
              />
            )}
          </div>
        </div>

        {error ? <p className="text-xs text-center text-destructive mt-2">{error}</p> : null}

        {step !== "foyer" ? (
          <button
            type="button"
            onClick={goNext}
            disabled={
              pending ||
              (step === "members" && members.length === 0) ||
              (step === "leclerc" &&
                !groceryOptional &&
                !isGroceryProviderConnected(groceryProvider))
            }
            className="w-full inline-flex items-center justify-center gap-2 bg-ink text-cream py-4 rounded-2xl text-sm font-medium disabled:opacity-50 mt-4 shrink-0"
          >
            {pending ? (
              <span className="maison-spinner" />
            ) : step === "leclerc" ? (
              "Entrer dans Maison"
            ) : (
              <>
                Continuer
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        ) : null}

        {householdKey ? (
          <p className="text-center mt-4 shrink-0">
            <MaisonSignOutButton variant="link" />
          </p>
        ) : null}
      </div>
    </div>
  );
}

/* ── Members sub-panel ── */

function MembersPanel({
  members, householdKey, copied, onCopyKey, draft, setDraft, showAddForm, setShowAddForm,
  pending, onAdd, onUpdate, onDelete,
}: {
  members: OnboardingMember[];
  householdKey: string;
  copied: boolean;
  onCopyKey: () => void;
  draft: DraftMember;
  setDraft: React.Dispatch<React.SetStateAction<DraftMember>>;
  showAddForm: boolean;
  setShowAddForm: (v: boolean) => void;
  pending: boolean;
  onAdd: (e: React.FormEvent) => void;
  onUpdate: (id: string, patch: Partial<Pick<OnboardingMember, "name" | "role" | "age">>, pin?: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="space-y-4">
      {householdKey ? (
        <div className="rounded-2xl bg-sage-soft/60 p-4 ring-1 ring-sage/20">
          <p className="text-[10px] uppercase tracking-wider text-sage mb-1">Clé du foyer</p>
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-2xl text-ink tracking-wider">{householdKey}</p>
            <button type="button" onClick={onCopyKey} className="size-9 rounded-full bg-paper ring-1 ring-black/[0.06] grid place-items-center">
              <Copy className="h-4 w-4 text-sage" />
            </button>
          </div>
          {copied ? <p className="text-[10px] text-sage mt-1">Copié !</p> : null}
        </div>
      ) : null}

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <UserPlus className="h-6 w-6 text-ash mx-auto mb-2" />
          <p className="text-sm text-ash">Aucun membre</p>
        </div>
      ) : (
        members.map((member) => (
          <MemberCard key={member.id} member={member} pending={pending} onSave={(p, pin) => onUpdate(member.id, p, pin)} onDelete={() => onDelete(member.id)} />
        ))
      )}

      {showAddForm ? (
        <form onSubmit={onAdd} className="rounded-2xl bg-paper ring-1 ring-sage/30 p-4 space-y-3 animate-rise">
          <p className="text-xs font-medium">Nouveau membre</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} placeholder="Marie" required />
            <Field label="Âge" value={draft.age} onChange={(v) => setDraft((d) => ({ ...d, age: v.replace(/\D/g, "") }))} placeholder="32" inputMode="numeric" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink/70">Rôle</label>
              <select className="maison-input mt-1.5" value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as MemberRole }))}>
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <PinField label="PIN" pin={draft.pin} showPin={showPin} onPinChange={(v) => setDraft((d) => ({ ...d, pin: v }))} onToggle={() => setShowPin((v) => !v)} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={pending || !draft.name.trim() || draft.pin.length < 4} className="flex-1 bg-ink text-cream py-3 rounded-xl text-sm font-medium disabled:opacity-50">Ajouter</button>
            <button type="button" onClick={() => { setShowAddForm(false); setDraft(emptyDraft()); }} className="px-4 py-3 rounded-xl text-sm text-ash ring-1 ring-black/[0.06]">Annuler</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowAddForm(true)} disabled={pending} className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-border text-sm text-sage">
          <Plus className="h-4 w-4" /> Ajouter un membre
        </button>
      )}

      <div className="rounded-xl bg-paper/60 ring-1 ring-black/[0.03] p-3 space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-ash">Bientôt</p>
        <div className="flex items-center gap-2 text-xs text-ash/80"><Link2 className="h-3.5 w-3.5" /> Invitation par lien</div>
        <div className="flex items-center gap-2 text-xs text-ash/80"><QrCode className="h-3.5 w-3.5" /> QR code</div>
      </div>
    </div>
  );
}

function MemberCard({ member, pending, onSave, onDelete }: {
  member: OnboardingMember; pending: boolean;
  onSave: (patch: Partial<Pick<OnboardingMember, "name" | "role" | "age">>, pin?: string) => void;
  onDelete: () => void;
}) {
  const [showPin, setShowPin] = useState(false);
  const [name, setName] = useState(member.name);
  const [age, setAge] = useState(member.age?.toString() ?? "");
  const [role, setRole] = useState(member.role);
  const [pinDraft, setPinDraft] = useState("");

  useEffect(() => {
    setName(member.name);
    setAge(member.age?.toString() ?? "");
    setRole(member.role);
  }, [member]);

  return (
    <div className="rounded-2xl bg-paper ring-1 ring-black/[0.05] p-4 space-y-3 animate-rise">
      <div className="flex items-start justify-between gap-2">
        <input className="font-medium text-sm bg-transparent border-b border-transparent focus:border-sage/40 outline-none flex-1" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => { if (name.trim() && name !== member.name) onSave({ name: name.trim() }); }} disabled={pending} />
        <button type="button" onClick={onDelete} disabled={pending} className="size-8 rounded-full text-ash hover:text-destructive grid place-items-center"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-ash uppercase tracking-wider">Âge</label>
          <input className="maison-input mt-1 py-2 text-sm" value={age} placeholder="—" inputMode="numeric" onChange={(e) => setAge(e.target.value.replace(/\D/g, ""))} onBlur={() => { const p = age.trim() ? parseInt(age, 10) : null; if (p !== member.age) onSave({ age: p }); }} disabled={pending} />
        </div>
        <div>
          <label className="text-[10px] text-ash uppercase tracking-wider">Rôle</label>
          <select className="maison-input mt-1 py-2 text-sm" value={role} onChange={(e) => { const n = e.target.value as MemberRole; setRole(n); onSave({ role: n }); }} disabled={pending}>
            <option value="member">Membre</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-ash uppercase tracking-wider">PIN</label>
        <div className="relative mt-1">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash" />
          <input type={showPin ? "text" : "password"} inputMode="numeric" className="maison-input pl-9 pr-9 py-2 text-sm" placeholder="••••" value={pinDraft} onChange={(e) => setPinDraft(e.target.value)} onBlur={() => { if (pinDraft.length >= 4) { onSave({}, pinDraft); setPinDraft(""); } }} disabled={pending} />
          <button type="button" onClick={() => setShowPin((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ash">{showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, inputMode }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink/70">{label}</label>
      <input className="maison-input mt-1.5" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} inputMode={inputMode} />
    </div>
  );
}

function PinField({ label, pin, showPin, onPinChange, onToggle }: {
  label: string; pin: string; showPin: boolean; onPinChange: (v: string) => void; onToggle: () => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-ink/70">{label}</label>
      <div className="relative mt-1.5">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
        <input type={showPin ? "text" : "password"} inputMode="numeric" className="maison-input pl-10 pr-10" value={pin} onChange={(e) => onPinChange(e.target.value)} placeholder="••••" minLength={4} required />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-ash">{showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
      </div>
    </div>
  );
}
