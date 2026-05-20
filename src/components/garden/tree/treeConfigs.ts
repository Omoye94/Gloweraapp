import { GrowthStage } from '../../../types/plant';

export interface StageConfig {
  // Trunk
  trunkHeight: [number, number]; // [min, max] interpolated by progressToNext
  trunkWidth: [number, number];
  trunkCurve: [number, number]; // bezier control point offset

  // Branches
  branchCount: [number, number];
  branchLength: [number, number];
  branchAngle: [number, number]; // degrees from trunk

  // Canopy
  leafClusterCount: [number, number];
  leafSize: [number, number];
  flowerCount: [number, number];
  flowerSize: [number, number];
  flowerOpenness: [number, number]; // 0=bud, 1=full bloom
  canopyRadius: [number, number];

  // Soil
  soilMoundHeight: [number, number];
  showSoilCrack: boolean;

  // Seed
  seedVisible: boolean;
  seedSinkDepth: [number, number]; // how deep seed sinks into soil
  seedCrackSize: [number, number];
  sproutHeight: [number, number]; // tiny green point

  // Particles
  particleCount: [number, number];
  particleTypes: ('sparkle' | 'petal' | 'firefly' | 'water' | 'soil')[];

  // Glow
  glowIntensity: [number, number];
  glowRadius: [number, number];

  // Ambient
  swayAmount: number; // degrees
  pulseAmount: number; // scale factor
}

export const STAGE_CONFIGS: Record<GrowthStage, StageConfig> = {
  seed: {
    trunkHeight: [0, 0],
    trunkWidth: [0, 0],
    trunkCurve: [0, 0],
    branchCount: [0, 0],
    branchLength: [0, 0],
    branchAngle: [0, 0],
    leafClusterCount: [0, 0],
    leafSize: [0, 0],
    flowerCount: [0, 0],
    flowerSize: [0, 0],
    flowerOpenness: [0, 0],
    canopyRadius: [0, 0],
    soilMoundHeight: [8, 12],
    showSoilCrack: false,
    seedVisible: true,
    seedSinkDepth: [0, 12],
    seedCrackSize: [0, 4],
    sproutHeight: [0, 8],
    particleCount: [0, 2],
    particleTypes: ['water', 'soil'],
    glowIntensity: [0, 0],
    glowRadius: [0, 0],
    swayAmount: 0,
    pulseAmount: 0.03,
  },
  sprout: {
    trunkHeight: [40, 110],
    trunkWidth: [3, 5],
    trunkCurve: [2, 6],
    branchCount: [0, 1],
    branchLength: [0, 15],
    branchAngle: [30, 45],
    leafClusterCount: [1, 4],
    leafSize: [6, 10],
    flowerCount: [0, 0],
    flowerSize: [0, 0],
    flowerOpenness: [0, 0],
    canopyRadius: [10, 25],
    soilMoundHeight: [6, 8],
    showSoilCrack: false,
    seedVisible: false,
    seedSinkDepth: [0, 0],
    seedCrackSize: [0, 0],
    sproutHeight: [0, 0],
    particleCount: [0, 1],
    particleTypes: ['sparkle'],
    glowIntensity: [0, 0],
    glowRadius: [0, 0],
    swayAmount: 3,
    pulseAmount: 0.02,
  },
  bud: {
    trunkHeight: [80, 120],
    trunkWidth: [6, 10],
    trunkCurve: [4, 8],
    branchCount: [2, 5],
    branchLength: [20, 40],
    branchAngle: [25, 55],
    leafClusterCount: [4, 8],
    leafSize: [8, 12],
    flowerCount: [0, 4],
    flowerSize: [4, 8],
    flowerOpenness: [0, 0.5],
    canopyRadius: [25, 45],
    soilMoundHeight: [5, 6],
    showSoilCrack: false,
    seedVisible: false,
    seedSinkDepth: [0, 0],
    seedCrackSize: [0, 0],
    sproutHeight: [0, 0],
    particleCount: [1, 3],
    particleTypes: ['sparkle', 'petal'],
    glowIntensity: [0, 0.1],
    glowRadius: [0, 20],
    swayAmount: 2,
    pulseAmount: 0.02,
  },
  bloom: {
    trunkHeight: [110, 130],
    trunkWidth: [9, 12],
    trunkCurve: [6, 10],
    branchCount: [4, 6],
    branchLength: [30, 50],
    branchAngle: [20, 60],
    leafClusterCount: [6, 12],
    leafSize: [10, 14],
    flowerCount: [4, 10],
    flowerSize: [8, 14],
    flowerOpenness: [0.6, 1],
    canopyRadius: [40, 60],
    soilMoundHeight: [4, 5],
    showSoilCrack: false,
    seedVisible: false,
    seedSinkDepth: [0, 0],
    seedCrackSize: [0, 0],
    sproutHeight: [0, 0],
    particleCount: [3, 6],
    particleTypes: ['sparkle', 'petal', 'firefly'],
    glowIntensity: [0.2, 0.5],
    glowRadius: [30, 50],
    swayAmount: 2,
    pulseAmount: 0.02,
  },
  glow: {
    trunkHeight: [130, 140],
    trunkWidth: [11, 14],
    trunkCurve: [8, 12],
    branchCount: [5, 7],
    branchLength: [40, 60],
    branchAngle: [20, 65],
    leafClusterCount: [10, 16],
    leafSize: [12, 16],
    flowerCount: [8, 14],
    flowerSize: [10, 16],
    flowerOpenness: [0.8, 1],
    canopyRadius: [55, 75],
    soilMoundHeight: [4, 5],
    showSoilCrack: false,
    seedVisible: false,
    seedSinkDepth: [0, 0],
    seedCrackSize: [0, 0],
    sproutHeight: [0, 0],
    particleCount: [6, 12],
    particleTypes: ['sparkle', 'petal', 'firefly'],
    glowIntensity: [0.4, 0.7],
    glowRadius: [50, 70],
    swayAmount: 1.5,
    pulseAmount: 0.015,
  },
};

// Interpolate a [min, max] range by progress (0-100)
export function lerp(range: [number, number], progress: number): number {
  const t = Math.max(0, Math.min(100, progress)) / 100;
  return range[0] + (range[1] - range[0]) * t;
}

// Get interpolated config values for a given stage and progress
export function getInterpolatedConfig(stage: GrowthStage, progress: number) {
  const cfg = STAGE_CONFIGS[stage];
  return {
    trunkHeight: lerp(cfg.trunkHeight, progress),
    trunkWidth: lerp(cfg.trunkWidth, progress),
    trunkCurve: lerp(cfg.trunkCurve, progress),
    branchCount: Math.round(lerp(cfg.branchCount, progress)),
    branchLength: lerp(cfg.branchLength, progress),
    branchAngle: lerp(cfg.branchAngle, progress),
    leafClusterCount: Math.round(lerp(cfg.leafClusterCount, progress)),
    leafSize: lerp(cfg.leafSize, progress),
    flowerCount: Math.round(lerp(cfg.flowerCount, progress)),
    flowerSize: lerp(cfg.flowerSize, progress),
    flowerOpenness: lerp(cfg.flowerOpenness, progress),
    canopyRadius: lerp(cfg.canopyRadius, progress),
    soilMoundHeight: lerp(cfg.soilMoundHeight, progress),
    seedSinkDepth: lerp(cfg.seedSinkDepth, progress),
    seedCrackSize: lerp(cfg.seedCrackSize, progress),
    sproutHeight: lerp(cfg.sproutHeight, progress),
    particleCount: Math.round(lerp(cfg.particleCount, progress)),
    glowIntensity: lerp(cfg.glowIntensity, progress),
    glowRadius: lerp(cfg.glowRadius, progress),
    seedVisible: cfg.seedVisible,
    particleTypes: cfg.particleTypes,
    swayAmount: cfg.swayAmount,
    pulseAmount: cfg.pulseAmount,
  };
}
