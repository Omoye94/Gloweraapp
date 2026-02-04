import { ReflectionPrompt } from '../types/journal';

export const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  // Weekly prompts
  { id: 'weekly-1', text: 'What brought you joy this week?', category: 'weekly' },
  { id: 'weekly-2', text: 'What is one thing you\'re proud of from this week?', category: 'weekly' },
  { id: 'weekly-3', text: 'How did you show yourself kindness this week?', category: 'weekly' },
  { id: 'weekly-4', text: 'What challenged you, and how did you respond?', category: 'weekly' },
  { id: 'weekly-5', text: 'What are you looking forward to next week?', category: 'weekly' },
  { id: 'weekly-6', text: 'How has your energy been? What affected it?', category: 'weekly' },
  { id: 'weekly-7', text: 'What boundaries did you set or honor this week?', category: 'weekly' },

  // Daily prompts
  { id: 'daily-1', text: 'What are three things you\'re grateful for today?', category: 'daily' },
  { id: 'daily-2', text: 'How are you really feeling right now?', category: 'daily' },
  { id: 'daily-3', text: 'What is one small win from today?', category: 'daily' },
  { id: 'daily-4', text: 'What do you need more of in your life right now?', category: 'daily' },
  { id: 'daily-5', text: 'What made you smile today?', category: 'daily' },
  { id: 'daily-6', text: 'How did you take care of yourself today?', category: 'daily' },
  { id: 'daily-7', text: 'What is weighing on your mind?', category: 'daily' },
  { id: 'daily-8', text: 'What would make tomorrow a good day?', category: 'daily' },
  { id: 'daily-9', text: 'What are you learning about yourself lately?', category: 'daily' },
  { id: 'daily-10', text: 'Who or what brought you comfort today?', category: 'daily' },

  // Challenge prompts
  { id: 'challenge-1', text: 'How do you feel about starting this challenge?', category: 'challenge' },
  { id: 'challenge-2', text: 'What\'s your motivation for this challenge?', category: 'challenge' },
  { id: 'challenge-3', text: 'What obstacles might you face, and how will you handle them?', category: 'challenge' },
  { id: 'challenge-4', text: 'How are you feeling halfway through?', category: 'challenge' },
  { id: 'challenge-5', text: 'What have you learned so far?', category: 'challenge' },
  { id: 'challenge-6', text: 'How has this challenge changed your routine?', category: 'challenge' },
];

export const getRandomPrompt = (category: 'weekly' | 'daily' | 'challenge'): ReflectionPrompt => {
  const prompts = REFLECTION_PROMPTS.filter(p => p.category === category);
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
};

export const getWeeklyPrompt = (): ReflectionPrompt => getRandomPrompt('weekly');
export const getDailyPrompt = (): ReflectionPrompt => getRandomPrompt('daily');
export const getChallengePrompt = (): ReflectionPrompt => getRandomPrompt('challenge');
