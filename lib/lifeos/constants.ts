import type { Achievement, CoachMessage, MapNode, Quest, UserProfile, World } from "./types";

export const LIFEOS_COLORS = {
  purple: { 900: "#4C1D95", 700: "#6D28D9", 500: "#8B5CF6", 300: "#C4B5FD", 100: "#EDE9FE" },
  green: { 600: "#58A700", 500: "#58CC02", 300: "#89E219", 100: "#E5F8D0" },
  orange: { 600: "#EA580C", 500: "#FF6B35", 300: "#FDBA74", 100: "#FFEDD5" },
  blue: "#1CB0F6",
  pink: "#EC4899",
  gold: "#F59E0B",
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  border: "#E8E4DF",
  text: "#1C1917",
  muted: "#78716C",
} as const;

export const WORLDS: World[] = [
  {
    id: "fitness",
    name: "Fitness",
    emoji: "🏋️",
    color: LIFEOS_COLORS.orange[500],
    level: 12,
    progress: 68,
    xpToNext: 420,
    description: "Strength, cardio & personal records",
  },
  {
    id: "nutrition",
    name: "Nutrition",
    emoji: "🥗",
    color: LIFEOS_COLORS.green[500],
    level: 9,
    progress: 54,
    xpToNext: 280,
    description: "Fuel your body like a pro",
  },
  {
    id: "work",
    name: "Work",
    emoji: "💼",
    color: LIFEOS_COLORS.blue,
    level: 15,
    progress: 72,
    xpToNext: 510,
    description: "Deep work & quest completion",
  },
  {
    id: "piano",
    name: "Piano",
    emoji: "🎹",
    color: LIFEOS_COLORS.pink,
    level: 7,
    progress: 45,
    xpToNext: 190,
    description: "Keys, chords & melodies",
  },
  {
    id: "reading",
    name: "Reading",
    emoji: "📖",
    color: LIFEOS_COLORS.purple[500],
    level: 11,
    progress: 61,
    xpToNext: 340,
    description: "Pages turned, minds expanded",
  },
  {
    id: "walking",
    name: "Walking",
    emoji: "🚶",
    color: LIFEOS_COLORS.gold,
    level: 20,
    progress: 88,
    xpToNext: 120,
    description: "Steps toward clarity",
  },
];

export const INITIAL_PROFILE: UserProfile = {
  name: "Alex",
  title: "Consistent Builder",
  level: 24,
  xp: 2340,
  xpToNextLevel: 3000,
  streak: 47,
  flameTier: "legendary",
  streakFreezes: 2,
  coins: 128,
};

export const INITIAL_QUESTS: Quest[] = [
  {
    id: "q1",
    title: "Morning walk — 20 min",
    worldId: "walking",
    xp: 40,
    status: "complete",
    period: "daily",
  },
  {
    id: "q2",
    title: "Log lunch",
    worldId: "nutrition",
    xp: 30,
    status: "pending",
    period: "daily",
    isHero: true,
  },
  {
    id: "q3",
    title: "25 min piano practice",
    worldId: "piano",
    xp: 50,
    status: "pending",
    period: "daily",
  },
  {
    id: "q4",
    title: "Deep work session — 45 min",
    worldId: "work",
    xp: 80,
    status: "pending",
    period: "daily",
  },
  {
    id: "q5",
    title: "Complete 4 workouts",
    worldId: "fitness",
    xp: 200,
    status: "pending",
    period: "weekly",
  },
  {
    id: "q6",
    title: "Read 3 chapters",
    worldId: "reading",
    xp: 150,
    status: "pending",
    period: "weekly",
  },
];

export const PIANO_MAP_NODES: MapNode[] = [
  { id: "p1", worldId: "piano", type: "mission", title: "Middle C basics", level: 1, status: "complete", xp: 30 },
  { id: "p2", worldId: "piano", type: "mission", title: "Right hand melody", level: 2, status: "complete", xp: 35 },
  { id: "p3", worldId: "piano", type: "checkpoint", title: "Week 2 checkpoint", level: 3, status: "complete", xp: 50 },
  { id: "p4", worldId: "piano", type: "mission", title: "Reading sheet music", level: 4, status: "complete", xp: 40 },
  { id: "p5", worldId: "piano", type: "mission", title: "Scale fundamentals", level: 5, status: "complete", xp: 45 },
  { id: "p6", worldId: "piano", type: "side", title: "Scale sprint", level: 5, status: "complete", xp: 50, sideBranch: true },
  { id: "p7", worldId: "piano", type: "mission", title: "Left hand independence", level: 6, status: "complete", xp: 55 },
  { id: "p8", worldId: "piano", type: "mission", title: "Chord transitions", level: 7, status: "active", xp: 60 },
  { id: "p9", worldId: "piano", type: "milestone", title: "Recital ready", level: 8, status: "locked", xp: 100 },
  { id: "p10", worldId: "piano", type: "boss", title: "Play Für Elise", level: 9, status: "locked", xp: 300 },
];

export const FITNESS_MAP_NODES: MapNode[] = [
  { id: "f1", worldId: "fitness", type: "mission", title: "Foundation push", level: 1, status: "complete", xp: 50 },
  { id: "f2", worldId: "fitness", type: "mission", title: "Foundation pull", level: 2, status: "complete", xp: 50 },
  { id: "f3", worldId: "fitness", type: "checkpoint", title: "4-week consistency", level: 3, status: "complete", xp: 80 },
  { id: "f4", worldId: "fitness", type: "mission", title: "Leg day mission", level: 4, status: "active", xp: 120 },
  { id: "f5", worldId: "fitness", type: "milestone", title: "8-week streak", level: 5, status: "locked", xp: 200 },
  { id: "f6", worldId: "fitness", type: "boss", title: "1000lb Club", level: 6, status: "locked", xp: 500 },
];

export const COACH_MESSAGES: CoachMessage[] = [
  {
    id: "c1",
    type: "insight",
    text: "You're 1 quest away from your weekly badge. Log lunch for +30 XP!",
  },
  {
    id: "c2",
    type: "nudge",
    text: "Piano Level 8 unlocks after today's chord session — ~25 min.",
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", title: "7-Day Spark", description: "7 day streak", emoji: "🔥", tier: "bronze", unlocked: true },
  { id: "a2", title: "30-Day Blaze", description: "30 day streak", emoji: "💪", tier: "silver", unlocked: true },
  { id: "a3", title: "First PR", description: "Set a personal record", emoji: "🏆", tier: "gold", unlocked: true },
  { id: "a4", title: "100-Day Legend", description: "100 day streak", emoji: "👑", tier: "legendary", unlocked: false },
  { id: "a5", title: "World Explorer", description: "5 active worlds", emoji: "🌍", tier: "gold", unlocked: true },
  { id: "a6", title: "Deep Focus", description: "10 focus sessions", emoji: "🎯", tier: "silver", unlocked: false },
];

export const NAV_ITEMS = [
  { href: "/demos/lifeos", label: "Home", icon: "home" as const },
  { href: "/demos/lifeos/map", label: "Map", icon: "map" as const },
  { href: "/demos/lifeos/act", label: "Act", icon: "act" as const, primary: true },
  { href: "/demos/lifeos/quests", label: "Quests", icon: "quests" as const },
  { href: "/demos/lifeos/profile", label: "You", icon: "profile" as const },
];
