import { Challenge } from '../types/challenge';

export const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: 'hydration-week',
    name: 'Hydration Week',
    description: 'Focus on drinking enough water every day. Your body will thank you!',
    duration: 7,
    category: 'nutrition',
    icon: '💧',
    pointsReward: 50,
    dailyTasks: [
      { day: 1, description: 'Drink 6 glasses of water' },
      { day: 2, description: 'Drink 7 glasses of water' },
      { day: 3, description: 'Drink 8 glasses of water' },
      { day: 4, description: 'Add lemon to your water' },
      { day: 5, description: 'Drink water first thing in the morning' },
      { day: 6, description: 'Track your water intake all day' },
      { day: 7, description: 'Celebrate! Keep up the hydration habit' },
    ],
  },
  {
    id: 'movement-journey',
    name: 'Gentle Movement Journey',
    description: 'A week of gentle, accessible movement for everyone.',
    duration: 7,
    category: 'movement',
    icon: '🌸',
    pointsReward: 50,
    dailyTasks: [
      { day: 1, description: '5-minute stretch when you wake up' },
      { day: 2, description: '10-minute walk outside' },
      { day: 3, description: 'Gentle yoga or stretching' },
      { day: 4, description: 'Dance to your favorite song' },
      { day: 5, description: '15-minute walk' },
      { day: 6, description: 'Try a new gentle exercise' },
      { day: 7, description: 'Rest day - light stretching only' },
    ],
  },
  {
    id: 'mindfulness-fortnight',
    name: 'Mindfulness Fortnight',
    description: 'Two weeks of building a mindfulness practice, one gentle step at a time.',
    duration: 14,
    category: 'reflection',
    icon: '🧘‍♀️',
    pointsReward: 100,
    dailyTasks: [
      { day: 1, description: '2-minute breathing exercise' },
      { day: 2, description: 'Notice 3 things you\'re grateful for' },
      { day: 3, description: '5-minute guided meditation' },
      { day: 4, description: 'Mindful eating at one meal' },
      { day: 5, description: 'Body scan relaxation' },
      { day: 6, description: 'Journaling: How do you feel today?' },
      { day: 7, description: 'Digital-free hour' },
      { day: 8, description: '10-minute meditation' },
      { day: 9, description: 'Practice self-compassion affirmations' },
      { day: 10, description: 'Mindful walking' },
      { day: 11, description: 'Evening reflection ritual' },
      { day: 12, description: 'Gratitude letter to yourself' },
      { day: 13, description: 'Create a calm space in your home' },
      { day: 14, description: 'Celebrate your mindfulness journey!' },
    ],
  },
  {
    id: 'self-care-week',
    name: 'Self-Care Sanctuary',
    description: 'A week dedicated to nurturing yourself with love and care.',
    duration: 7,
    category: 'self-care',
    icon: '🛁',
    pointsReward: 50,
    dailyTasks: [
      { day: 1, description: 'Morning skincare ritual' },
      { day: 2, description: 'Take a relaxing bath or shower' },
      { day: 3, description: 'Get to bed 30 minutes earlier' },
      { day: 4, description: 'Wear something that makes you feel good' },
      { day: 5, description: 'Screen-free wind-down routine' },
      { day: 6, description: 'Do something just for you' },
      { day: 7, description: 'Full self-care day - you deserve it!' },
    ],
  },
  {
    id: 'creative-spark',
    name: 'Creative Spark',
    description: 'Reignite your creativity with simple, fun activities.',
    duration: 7,
    category: 'hobbies',
    icon: '🎨',
    pointsReward: 50,
    dailyTasks: [
      { day: 1, description: 'Doodle for 10 minutes' },
      { day: 2, description: 'Write a short poem or story' },
      { day: 3, description: 'Take photos of beautiful things' },
      { day: 4, description: 'Listen to a new music genre' },
      { day: 5, description: 'Try a simple craft project' },
      { day: 6, description: 'Cook something new' },
      { day: 7, description: 'Share your creativity with someone' },
    ],
  },
];

export const getChallengeById = (id: string): Challenge | undefined => {
  return DEFAULT_CHALLENGES.find(c => c.id === id);
};

export const getChallengesByCategory = (category: string): Challenge[] => {
  return DEFAULT_CHALLENGES.filter(c => c.category === category);
};
