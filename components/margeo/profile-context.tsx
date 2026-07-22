"use client";

import { createContext, useContext } from "react";
import type { UserProfile } from "@/lib/margeo/types";

const ProfileContext = createContext<UserProfile | null>(null);

export function ProfileProvider({
  profile,
  children,
}: {
  profile: UserProfile;
  children: React.ReactNode;
}) {
  return (
    <ProfileContext.Provider value={profile}>{children}</ProfileContext.Provider>
  );
}

export function useDriveelyProfile(): UserProfile {
  const profile = useContext(ProfileContext);
  if (!profile) {
    throw new Error("useDriveelyProfile doit être utilisé dans ProfileProvider");
  }
  return profile;
}
