export type WorldId =
  | "fitness"
  | "nutrition"
  | "work"
  | "piano"
  | "reading"
  | "walking"
  | "business"
  | "learning";

export type QuestStatus = "pending" | "complete" | "locked";

export type NodeType = "mission" | "milestone" | "boss" | "checkpoint" | "side";

export type FlameTier = "spark" | "blaze" | "inferno" | "legendary" | "mythic";

export interface World {
  id: WorldId;
  name: string;
  emoji: string;
  color: string;
  level: number;
  progress: number;
  xpToNext: number;
  description: string;
}

export interface Quest {
  id: string;
  title: string;
  worldId: WorldId;
  xp: number;
  status: QuestStatus;
  period: "daily" | "weekly" | "monthly";
  isHero?: boolean;
}

export interface MapNode {
  id: string;
  worldId: WorldId;
  type: NodeType;
  title: string;
  level: number;
  status: "locked" | "active" | "complete";
  xp: number;
  sideBranch?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold" | "legendary";
  unlocked: boolean;
}

export interface UserProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  flameTier: FlameTier;
  streakFreezes: number;
  coins: number;
}

export interface CoachMessage {
  id: string;
  type: "insight" | "nudge" | "celebrate" | "recovery";
  text: string;
}
