export type GardenThemeId = 'calm' | 'bloom' | 'cozy';

export interface GardenTheme {
  id: GardenThemeId;
  name: string;
  emoji: string;
  description: string;
  leafTint: string;
  flowerTint: string;
  glowAuraTint: string;
  backgroundGradient: [string, string];
  swatchColors: [string, string, string];
}

export const GARDEN_THEMES: Record<GardenThemeId, GardenTheme> = {
  calm: {
    id: 'calm',
    name: 'Calm Garden',
    emoji: '\uD83C\uDF3F',
    description: 'Soft pinks & warm linen',
    leafTint: '#D4D1AA',
    flowerTint: '#F2B4CC',
    glowAuraTint: '#F1E1E1',
    backgroundGradient: ['#FBF7F7', '#EDE4DC'],
    swatchColors: ['#F2B4CC', '#EDE4DC', '#FBF7F7'],
  },
  bloom: {
    id: 'bloom',
    name: 'Bloom Garden',
    emoji: '\uD83C\uDF38',
    description: 'Rich roses & deep greens',
    leafTint: '#5A8A50',
    flowerTint: '#C45A82',
    glowAuraTint: '#F2B4CC',
    backgroundGradient: ['#FBF7F7', '#F1E1E1'],
    swatchColors: ['#5A8A50', '#C45A82', '#FBF7F7'],
  },
  cozy: {
    id: 'cozy',
    name: 'Cozy Garden',
    emoji: '\uD83D\uDD6F\uFE0F',
    description: 'Warm amber & golden glow',
    leafTint: '#8A9A60',
    flowerTint: '#E8B870',
    glowAuraTint: '#E8C880',
    backgroundGradient: ['#EDE4DC', '#E2CBB2'],
    swatchColors: ['#8A9A60', '#E8B870', '#EDE4DC'],
  },
};

export const GARDEN_THEME_LIST: GardenTheme[] = Object.values(GARDEN_THEMES);
