import { GrowthStage } from '../types/plant';

const SEED_MESSAGES = [
  'Every ritual you keep is a promise to yourself — and you are keeping it.',
  'The most powerful journeys begin exactly where you are right now.',
  'You planted a seed today. That takes more courage than you know.',
  'Showing up for yourself, even in small ways, changes everything.',
  'You are not starting over. You are starting right.',
  'Consistency is quietly becoming your superpower.',
  'This is how transformation begins — one gentle choice at a time.',
  'The version of you who keeps going? She is already on her way.',
];

const SPROUT_MESSAGES = [
  'Look at what your consistency is already building.',
  'You showed up. Again. That is not small — that is everything.',
  'Growth is happening even when you cannot see it. Trust the process.',
  'Every day you choose yourself, you get a little stronger.',
  'You are already further along than yesterday. Keep going.',
  'Something beautiful is forming because of your effort.',
  'This is what self-care looks like in real life — you are doing it.',
  'The version of you that doubted herself? She would be proud.',
];

const BUD_MESSAGES = [
  'You have come too far to stop now. And you know it.',
  'Your habits are becoming who you are. Keep building her.',
  'This is the season where everything starts to click.',
  'You are not almost there — you are already there, still growing.',
  'Look at the rhythm you have created. That is real discipline.',
  'Every ritual you honour makes the next one easier.',
  'You are becoming the woman you always wanted to be.',
  'The glow you are chasing? It starts with exactly what you are doing.',
];

const BLOOM_MESSAGES = [
  'You are in full bloom — and you earned every petal.',
  'This is what it looks like when a woman truly invests in herself.',
  'Your consistency has become your identity. Own it.',
  'You did not get here by luck. You got here by showing up.',
  'Everything you practised is now a part of who you are.',
  'This is your season. You made it happen.',
  'You are living proof that small daily rituals create extraordinary change.',
  'The discipline you built? Nobody can take that from you.',
];

const GLOW_MESSAGES = [
  'This is your glow era. You built this — ritual by ritual.',
  'You are at your most radiant when you are the most consistent.',
  'You have proven to yourself that you can do hard things. Remember that.',
  'From seed to glow — every step was a choice you made for yourself.',
  'You are not just glowing. You are inspiring every woman who sees you.',
  'This light you carry? It grew because you chose to tend to it.',
  'The woman you are today is the one you worked so hard to become.',
  'You glowed up. Quietly, consistently, powerfully. That is yours forever.',
];

const STAGE_MESSAGES: Record<GrowthStage, string[]> = {
  seed: SEED_MESSAGES,
  sprout: SPROUT_MESSAGES,
  bud: BUD_MESSAGES,
  bloom: BLOOM_MESSAGES,
  glow: GLOW_MESSAGES,
};

export function getDailyGardenMessage(stage: GrowthStage, date: Date = new Date()): string {
  const messages = STAGE_MESSAGES[stage];
  const hash = date.getDate() + date.getMonth() * 31;
  return messages[hash % messages.length];
}
