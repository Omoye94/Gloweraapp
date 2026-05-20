import { GrowthStage } from '../../../types/plant';

export interface StageColors {
  trunk: string;
  trunkDark: string;
  branch: string;
  leaf: string;
  leafLight: string;
  leafDark: string;
  flower: string;
  flowerCenter: string;
  flowerGlow: string;
  soil: string;
  soilDark: string;
  soilLight: string;
  particle: string;
  particleAlt: string;
  glowAura: string;
  seed: string;
  seedCrack: string;
}

export const STAGE_COLORS: Record<GrowthStage, StageColors> = {
  seed: {
    trunk: '#9B7A5E',
    trunkDark: '#7A5A42',
    branch: '#9B7A5E',
    leaf: '#8FA886',
    leafLight: '#D0E4C8',
    leafDark: '#8AAE7A',
    flower: '#F2B4CC',
    flowerCenter: '#C45A82',
    flowerGlow: 'rgba(244, 198, 204, 0.3)',
    soil: '#C4A898',
    soilDark: '#9E7E70',
    soilLight: '#EDE0DB',
    particle: '#F2B4CC',
    particleAlt: '#EDE0DB',
    glowAura: 'rgba(244, 198, 204, 0.15)',
    seed: '#A07850',
    seedCrack: '#7A5A38',
  },
  sprout: {
    trunk: '#8AAE7A',
    trunkDark: '#6A8E5A',
    branch: '#8AAE7A',
    leaf: '#8FA886',
    leafLight: '#D0E4C8',
    leafDark: '#8AAE7A',
    flower: '#F2B4CC',
    flowerCenter: '#C45A82',
    flowerGlow: 'rgba(244, 198, 204, 0.3)',
    soil: '#C4A898',
    soilDark: '#9E7E70',
    soilLight: '#EDE0DB',
    particle: '#9B86D4',
    particleAlt: '#F2B4CC',
    glowAura: 'rgba(184, 206, 172, 0.15)',
    seed: '#A07850',
    seedCrack: '#7A5A38',
  },
  bud: {
    trunk: '#9B7A5E',
    trunkDark: '#7A5A42',
    branch: '#8A6A50',
    leaf: '#8FA886',
    leafLight: '#D0E4C8',
    leafDark: '#8AAE7A',
    flower: '#F2B4CC',
    flowerCenter: '#C45A82',
    flowerGlow: 'rgba(244, 198, 204, 0.35)',
    soil: '#C4A898',
    soilDark: '#9E7E70',
    soilLight: '#EDE0DB',
    particle: '#F2B4CC',
    particleAlt: '#9B86D4',
    glowAura: 'rgba(244, 198, 204, 0.20)',
    seed: '#A07850',
    seedCrack: '#7A5A38',
  },
  bloom: {
    trunk: '#9B7A5E',
    trunkDark: '#7A5A42',
    branch: '#8A6A50',
    leaf: '#8FA886',
    leafLight: '#D0E4C8',
    leafDark: '#8AAE7A',
    flower: '#C45A82',
    flowerCenter: '#F2B4CC',
    flowerGlow: 'rgba(212, 144, 154, 0.45)',
    soil: '#C4A898',
    soilDark: '#9E7E70',
    soilLight: '#EDE0DB',
    particle: '#F2B4CC',
    particleAlt: '#9B86D4',
    glowAura: 'rgba(212, 144, 154, 0.25)',
    seed: '#A07850',
    seedCrack: '#7A5A38',
  },
  glow: {
    trunk: '#9B7A5E',
    trunkDark: '#7A5A42',
    branch: '#8A6A50',
    leaf: '#D0E4C8',
    leafLight: '#EDF5E8',
    leafDark: '#8FA886',
    flower: '#F2B4CC',
    flowerCenter: '#9B86D4',
    flowerGlow: 'rgba(212, 201, 248, 0.5)',
    soil: '#C4A898',
    soilDark: '#9E7E70',
    soilLight: '#EDE0DB',
    particle: '#9B86D4',
    particleAlt: '#F2B4CC',
    glowAura: 'rgba(212, 201, 248, 0.30)',
    seed: '#A07850',
    seedCrack: '#7A5A38',
  },
};

// Cosmetic particle color overrides
export const COSMETIC_PARTICLE_COLORS: Record<string, { primary: string; secondary: string }> = {
  default: { primary: '#F2B4CC', secondary: '#F1E1E1' },
  golden_glow: { primary: '#FFD700', secondary: '#FFA500' },
  aurora_particles: { primary: '#FF6B9D', secondary: '#C084FC' },
};
