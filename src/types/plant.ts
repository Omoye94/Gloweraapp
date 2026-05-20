export type GrowthStage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'glow';

export type PlantMood = 'glowing' | 'happy' | 'sleepy' | 'wilting';

export type CosmeticType = 'particle_color' | 'plant_style' | 'background';

export interface CosmeticUnlock {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  prestigePointsRequired: number;
  emoji: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  streakMilestonesHit: number[]; // milestone day counts already awarded
}

export interface ActiveCosmetics {
  plantStyle: string;
  particleColor: string;
  background: string;
}

export interface ArchivedPlant {
  year: number;
  finalStage: GrowthStage;
  totalPoints: number;
  stageReachedAt: PlantState['stageReachedAt'];
  longestStreak: number;
}

export interface PlantState {
  currentStage: GrowthStage;
  totalLifetimePoints: number;
  plantStyle: string;
  stageReachedAt: {
    seed: string;
    sprout?: string;
    bud?: string;
    bloom?: string;
    glow?: string;
  };
  activeYear: number;
  gardenHistory: ArchivedPlant[];
  streak: StreakData;
  unlockedCosmetics: string[];
  activeCosmetics: ActiveCosmetics;
  dailyActionPoints: Record<string, number>; // keyed by YYYY-MM-DD
  gardenTheme: string;
}

// Points needed to reach each stage
export const GROWTH_THRESHOLDS: Record<GrowthStage, number> = {
  seed: 0,
  sprout: 200,
  bud: 1500,
  bloom: 3500,
  glow: 12000,
};

// Stage progression order
export const STAGE_ORDER: GrowthStage[] = ['seed', 'sprout', 'bud', 'bloom', 'glow'];

// Display names for stages
export const STAGE_NAMES: Record<GrowthStage, string> = {
  seed: 'Seed',
  sprout: 'Sprout',
  bud: 'Bud',
  bloom: 'Bloom',
  glow: 'Glow',
};

// Stage descriptions
export const STAGE_DESCRIPTIONS: Record<GrowthStage, string> = {
  seed: 'Every journey begins with a single step',
  sprout: 'Your garden is starting to wake up',
  bud: 'Beautiful things are forming',
  bloom: 'Your care is showing in every petal',
  glow: 'You radiate warmth and growth',
};

// Cosmetic unlocks earned via prestige points (points above glow threshold)
export const COSMETIC_UNLOCKS: CosmeticUnlock[] = [
  {
    id: 'golden_glow',
    name: 'Golden Glow',
    description: 'Your particles shimmer with gold',
    type: 'particle_color',
    prestigePointsRequired: 500,
    emoji: '\u2728',
  },
  {
    id: 'sakura_plant',
    name: 'Sakura',
    description: 'A delicate cherry blossom plant',
    type: 'plant_style',
    prestigePointsRequired: 1500,
    emoji: '\uD83C\uDF38',
  },
  {
    id: 'aurora_particles',
    name: 'Aurora',
    description: 'Rainbow-colored floating particles',
    type: 'particle_color',
    prestigePointsRequired: 3000,
    emoji: '\uD83C\uDF08',
  },
  {
    id: 'moonlight_garden',
    name: 'Moonlight Garden',
    description: 'A serene silver-lit garden backdrop',
    type: 'background',
    prestigePointsRequired: 5000,
    emoji: '\uD83C\uDF19',
  },
  {
    id: 'crystal_plant',
    name: 'Crystal',
    description: 'A crystalline, diamond-like plant',
    type: 'plant_style',
    prestigePointsRequired: 8000,
    emoji: '\uD83D\uDC8E',
  },
  {
    id: 'celestial_garden',
    name: 'Celestial Garden',
    description: 'Stars and comets fill your garden sky',
    type: 'background',
    prestigePointsRequired: 12000,
    emoji: '\uD83C\uDF20',
  },
];
