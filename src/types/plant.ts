export type GrowthStage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'glow';

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
}

// Points needed to reach each stage
export const GROWTH_THRESHOLDS: Record<GrowthStage, number> = {
  seed: 0,
  sprout: 50,
  bud: 150,
  bloom: 350,
  glow: 700,
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
