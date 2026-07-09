import type { ExerciseBlock, WorkoutFormatType } from "@cali/types";

export interface ExerciseCatalogEntry {
  definition: string;
  /** Clés normalisées (sans accents, alphanum). */
  keys: string[];
}

export const EXERCISE_CATALOG: ExerciseCatalogEntry[] = [
  {
    keys: ["deadhang", "suspensionpassive"],
    definition:
      "Suspension à la barre, bras tendus, épaules en dépression. Active les doigts et le gainage sans tirer.",
  },
  {
    keys: ["scapularpullup", "retractionscapulaire", "scapularpull"],
    definition:
      "À la barre, bras tendus : tire les omoplates vers le bas et l'arrière sans plier les coudes.",
  },
  {
    keys: ["facepull", "bandfacepull", "tiragevisage"],
    definition:
      "Tirage horizontal avec élastique vers le visage, coudes hauts, omoplates serrées en fin de mouvement.",
  },
  {
    keys: ["explosivepullup", "pullupexp", "tractionexplosive"],
    definition:
      "Traction rapide et explosive en montée, contrôle la descente. Prépare le système nerveux au tirage.",
  },
  {
    keys: ["hollowrock", "hollowbodyrock"],
    definition:
      "Sur le dos, corps en position hollow : bas du dos plaqué, jambes et épaules décollées, balancement contrôlé.",
  },
  {
    keys: ["pullup", "traction", "weightedpullup", "tractionlestee"],
    definition:
      "Tirage vertical à la barre, poitrine vers la barre, coudes vers les hanches, dépression scapulaire en bas.",
  },
  {
    keys: ["frontlever", "frontleverhold", "assistedfrontleverhold"],
    definition:
      "Corps horizontal face au sol, bras tendus, bassin rétroversé, épaules basses. Forte demande dorsale et abdominale.",
  },
  {
    keys: ["frontleverraise", "frontleverraises"],
    definition:
      "Depuis la pendaison, montée contrôlée vers la position front lever en gardant le corps gainé.",
  },
  {
    keys: ["frontleverrow", "bandfrontleverrow"],
    definition:
      "Tirage horizontal en position de lever assisté, corps le plus horizontal possible au point fort.",
  },
  {
    keys: ["highpullupisometric", "isometriehaute"],
    definition:
      "Maintien en haut de traction, menton au-dessus de la barre, coudes serrés au corps.",
  },
  {
    keys: ["highhalfpullup", "demitraction"],
    definition:
      "Demi-amplitude en haut de traction : de la position haute jusqu'à environ 90° de coude puis retour.",
  },
  {
    keys: ["lsit"],
    definition:
      "Assis ou à la barre, jambes tendues parallèles au sol, bassin en antéversion, épaules basses.",
  },
  {
    keys: ["hanginglegraise", "relevejambesuspendu"],
    definition:
      "Suspendu à la barre, montée des jambes tendues vers la barre en contrôlant le bas du dos.",
  },
  {
    keys: ["hollowbodyhold", "hollowhold"],
    definition:
      "Allongé, position hollow maintenue : bas du dos au sol, bras et jambes décollés, gainage global.",
  },
  {
    keys: ["dragonflag", "dragonflagnegative"],
    definition:
      "Sur banc, corps rigide épaules-pieds, descente lente en négatif depuis la verticale.",
  },
  {
    keys: ["pushup", "pompes"],
    definition:
      "Mains au sol, corps aligné, poitrine vers le sol, coudes à environ 45° du buste.",
  },
  {
    keys: ["dip"],
    definition:
      "Sur barres parallèles, descente contrôlée jusqu'à 90° de coude, poussée explosive.",
  },
  {
    keys: ["plank", "gainageplanche"],
    definition:
      "Appui avant-bras et orteils, corps aligné, fessiers et abdos serrés, pas de creux lombaire.",
  },
  {
    keys: ["burpee"],
    definition:
      "Enchaînement squat, planche, pompe optionnelle et saut. Cardio et full body.",
  },
  {
    keys: ["jumpingjack"],
    definition:
      "Saut pieds écartés bras au-dessus de la tête, retour position initiale. Échauffement cardio léger.",
  },
];

export function normalizeExerciseKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

export function lookupExerciseDefinition(name: string): string | undefined {
  const key = normalizeExerciseKey(name);
  if (!key) return undefined;

  for (const entry of EXERCISE_CATALOG) {
    if (entry.keys.some((k) => key === k)) {
      return entry.definition;
    }
  }

  let best: { length: number; definition: string } | undefined;

  for (const entry of EXERCISE_CATALOG) {
    for (const catalogKey of entry.keys) {
      if (catalogKey.length < 5) continue;
      if (key.includes(catalogKey) && (!best || catalogKey.length > best.length)) {
        best = { length: catalogKey.length, definition: entry.definition };
      }
    }
  }

  return best?.definition;
}

function parseTargetReps(reps: number | string | undefined): number | undefined {
  if (typeof reps === "number") return reps;
  if (typeof reps === "string") {
    const n = Number.parseInt(reps, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Repos entre exercices d'échauffement — adapté au format et à l'intensité.
 */
export function estimateWarmupRestSeconds(exercise: ExerciseBlock): number {
  const set = exercise.sets?.[0];
  const name = normalizeExerciseKey(exercise.name);
  const format: WorkoutFormatType = exercise.format;

  if (format === "hold" || format === "isometric" || format === "time") {
    const duration = set?.durationSeconds ?? 20;
    return clamp(Math.round(duration * 0.5), 10, 25);
  }

  if (format === "weighted") return 45;

  if (name.includes("explosif") || name.includes("explosive")) return 40;
  if (name.includes("facepull") || name.includes("scapular")) return 15;
  if (name.includes("deadhang") || name.includes("suspension")) return 12;
  if (name.includes("hollow")) return 15;

  const reps = parseTargetReps(set?.targetReps);
  if (reps != null) {
    if (reps <= 5) return 30;
    if (reps <= 10) return 20;
    return 15;
  }

  if (set?.restAfterSeconds != null && set.restAfterSeconds > 0) {
    return set.restAfterSeconds;
  }

  return 15;
}
