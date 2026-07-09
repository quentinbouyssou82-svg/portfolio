"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { INITIAL_PROFILE, INITIAL_QUESTS } from "./constants";
import type { Quest, UserProfile } from "./types";

interface Celebration {
  type: "xp" | "level" | "quest";
  amount?: number;
  message?: string;
}

interface LifeOSContextValue {
  profile: UserProfile;
  quests: Quest[];
  completeQuest: (id: string) => void;
  celebration: Celebration | null;
  clearCelebration: () => void;
  weeklyProgress: number[];
}

const LifeOSContext = createContext<LifeOSContextValue | null>(null);

export function LifeOSProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  const weeklyProgress = useMemo(() => [1, 1, 1, 0.8, 1, 0.6, 0.4], []);

  const completeQuest = useCallback(
    (id: string) => {
      const quest = quests.find((q) => q.id === id);
      if (!quest || quest.status === "complete") return;

      setQuests((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "complete" as const } : q)),
      );

      setProfile((prev) => {
        const newXp = prev.xp + quest.xp;
        const leveledUp = newXp >= prev.xpToNextLevel;
        if (leveledUp) {
          setCelebration({
            type: "level",
            message: `Level ${prev.level + 1} unlocked!`,
          });
          return {
            ...prev,
            level: prev.level + 1,
            xp: newXp - prev.xpToNextLevel,
            xpToNextLevel: Math.round(prev.xpToNextLevel * 1.15),
          };
        }
        setCelebration({ type: "xp", amount: quest.xp });
        return { ...prev, xp: newXp };
      });
    },
    [quests],
  );

  const clearCelebration = useCallback(() => setCelebration(null), []);

  const value = useMemo(
    () => ({
      profile,
      quests,
      completeQuest,
      celebration,
      clearCelebration,
      weeklyProgress,
    }),
    [profile, quests, completeQuest, celebration, clearCelebration, weeklyProgress],
  );

  return <LifeOSContext.Provider value={value}>{children}</LifeOSContext.Provider>;
}

export function useLifeOS() {
  const ctx = useContext(LifeOSContext);
  if (!ctx) throw new Error("useLifeOS must be used within LifeOSProvider");
  return ctx;
}
