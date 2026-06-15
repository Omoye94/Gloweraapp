export type AffirmationCategory = 'glow' | 'growth' | 'strength' | 'mindfulness' | 'joy';

export interface Affirmation {
  id: string;
  text: string;
  category: AffirmationCategory;
}

export const AFFIRMATION_CATEGORY_COLORS: Record<AffirmationCategory, string> = {
  glow: '#F2B4CC',
  growth: '#9B86D4',
  strength: '#C45A82',
  mindfulness: '#8FA886',
  joy: '#E2CBB2',
};

export const AFFIRMATIONS: Affirmation[] = [
  // glow
  { id: 'glow-1', text: 'I am worthy of love exactly as I am today.', category: 'glow' },
  { id: 'glow-2', text: 'My skin, my story, my glow — all mine.', category: 'glow' },
  { id: 'glow-3', text: 'I tend to myself the way I tend to what I love.', category: 'glow' },
  { id: 'glow-4', text: 'Beauty lives in how I carry myself through the world.', category: 'glow' },
  { id: 'glow-5', text: 'I am enough, right here, right now.', category: 'glow' },
  { id: 'glow-6', text: 'Caring for myself is not vanity — it is devotion.', category: 'glow' },
  // growth
  { id: 'growth-1', text: 'I am becoming who I was always meant to be.', category: 'growth' },
  { id: 'growth-2', text: 'Every small act of care is a seed I am planting.', category: 'growth' },
  { id: 'growth-3', text: 'Progress does not have to be loud to be real.', category: 'growth' },
  { id: 'growth-4', text: 'I give myself permission to be a work in progress.', category: 'growth' },
  { id: 'growth-5', text: 'What I am building takes time, and that is okay.', category: 'growth' },
  { id: 'growth-6', text: 'Each day I return to myself is a victory.', category: 'growth' },
  { id: 'growth-7', text: 'Routines are rituals of devotion to yourself and your dreams.', category: 'growth' },
  // strength
  { id: 'strength-1', text: 'I have survived every hard day until now.', category: 'strength' },
  { id: 'strength-2', text: 'My softness is not weakness — it is strength.', category: 'strength' },
  { id: 'strength-3', text: 'I can do hard things with grace.', category: 'strength' },
  { id: 'strength-4', text: 'I rise even when it feels like too much.', category: 'strength' },
  { id: 'strength-5', text: 'I trust my body to carry me through.', category: 'strength' },
  { id: 'strength-6', text: 'I am braver than I give myself credit for.', category: 'strength' },
  // mindfulness
  { id: 'mindful-1', text: 'I am here. This breath is enough.', category: 'mindfulness' },
  { id: 'mindful-2', text: 'I release what I cannot control and return to now.', category: 'mindfulness' },
  { id: 'mindful-3', text: 'Peace is something I can choose, even in small doses.', category: 'mindfulness' },
  { id: 'mindful-4', text: 'My mind deserves as much care as my body.', category: 'mindfulness' },
  { id: 'mindful-5', text: 'I slow down and notice what is beautiful.', category: 'mindfulness' },
  { id: 'mindful-6', text: 'Stillness is productive. Rest is sacred.', category: 'mindfulness' },
  // joy
  { id: 'joy-1', text: 'I deserve to take up space and enjoy it.', category: 'joy' },
  { id: 'joy-2', text: 'Delight is not frivolous — it is fuel.', category: 'joy' },
  { id: 'joy-3', text: 'I look for light in ordinary moments.', category: 'joy' },
  { id: 'joy-4', text: 'I give myself permission to feel good today.', category: 'joy' },
  { id: 'joy-5', text: 'There is something worth smiling about right now.', category: 'joy' },
  { id: 'joy-6', text: 'My happiness is worth prioritising.', category: 'joy' },
];

export function getDailyAffirmation(): Affirmation {
  const today = new Date();
  const hash = today.getDate() + today.getMonth() * 31;
  return AFFIRMATIONS[hash % AFFIRMATIONS.length];
}

export function getAffirmationIndex(affirmation: Affirmation): number {
  return AFFIRMATIONS.findIndex(a => a.id === affirmation.id);
}

export function getNextAffirmation(currentIndex: number): Affirmation {
  return AFFIRMATIONS[(currentIndex + 1) % AFFIRMATIONS.length];
}
