import { FocusArea, HabitCategory, PlantGrowthStage, SupplementTimeOfDay } from '../types';

// Color palette
export const colors = {
  primary: '#8BA087',
  primaryLight: '#E8C4B8',
  primaryDark: '#A85C3C',
  secondary: '#9AAE96',
  secondaryLight: '#E0EBD9',
  secondaryDark: '#A85C3C',
  accent: '#B5C4B1',
  accentLight: '#E0EBD9',
  accentDark: '#7BB894',
  background: '#F5E6DC',
  surface: '#FFFFFF',
  text: '#4A4A4A',
  textLight: '#8A8A8A',
  success: '#B4E8C7',
  warning: '#E8D4B4',
  error: '#E8B4B4',
} as const;

// Category colors
export const categoryColors: Record<HabitCategory, string> = {
  nutrition: '#FFD6E0',
  movement: '#C7E9FF',
  supplements: '#D4FFE0',
  hobbies: '#FFE4C7',
  self_care: '#E4D4FF',
  reflection: '#FFF4C7',
};

// Category icons (Lucide icon names)
export const categoryIcons: Record<HabitCategory, string> = {
  nutrition: 'apple',
  movement: 'activity',
  supplements: 'pill',
  hobbies: 'palette',
  self_care: 'heart',
  reflection: 'book-open',
};

// Category labels
export const categoryLabels: Record<HabitCategory, string> = {
  nutrition: 'Nutrition',
  movement: 'Movement',
  supplements: 'Supplements',
  hobbies: 'Hobbies',
  self_care: 'Self-Care',
  reflection: 'Reflection',
};

// Points system
export const POINTS = {
  HABIT_GENTLY: 5,
  HABIT_FULLY: 10,
  DAILY_COMPLETE: 25,
  CHALLENGE_COMPLETE: 50,
  REFLECTION_COMPLETE: 10,
  SUPPLEMENT_TAKEN: 5,
  ALL_SUPPLEMENTS_TAKEN: 15,
} as const;

// Plant growth thresholds
export const PLANT_GROWTH_THRESHOLDS: Record<PlantGrowthStage, number> = {
  seed: 0,
  sprout: 50,
  bud: 150,
  bloom: 300,
  glow: 500,
};

// Plant growth messages
export const PLANT_GROWTH_MESSAGES: Record<PlantGrowthStage, string> = {
  seed: "Your journey begins here. Every small step matters.",
  sprout: "Look at you grow! Your consistency is showing.",
  bud: "Beautiful progress! You're nurturing yourself so well.",
  bloom: "You're blooming! Your dedication is inspiring.",
  glow: "You're glowing! You've created something beautiful.",
};

// Encouraging messages for habit completion
export const COMPLETION_MESSAGES = {
  gently: [
    "Gentle progress is still progress",
    "You showed up for yourself today",
    "Small steps, big heart",
    "Every little bit counts",
    "You're doing beautifully",
  ],
  fully: [
    "Amazing! You gave it your all",
    "Your dedication is inspiring",
    "You're glowing today",
    "Full commitment, full glow",
    "You're taking such good care of yourself",
  ],
  dailyComplete: [
    "What a beautiful day of self-care!",
    "You completed all your rituals today",
    "Your glow is radiating",
    "Today was a gift you gave yourself",
    "Perfect day, perfect you",
  ],
};

// Greeting messages based on time of day
export const getGreeting = (name: string | null): string => {
  const hour = new Date().getHours();
  const displayName = name || 'beautiful';

  if (hour < 12) {
    return `Good morning, ${displayName}`;
  } else if (hour < 17) {
    return `Good afternoon, ${displayName}`;
  } else {
    return `Good evening, ${displayName}`;
  }
};

// Focus area descriptions for onboarding
export const focusAreaDescriptions: Record<FocusArea, string> = {
  nutrition: "Nourish your body with mindful eating habits",
  movement: "Move your body in ways that feel good",
  supplements: "Track vitamins and supplements with ease",
  hobbies: "Make time for activities that bring you joy",
  self_care: "Prioritize rest, skincare, and self-love",
  reflection: "Journal and reflect on your journey",
};

// Default habit suggestions by category (legacy - string only)
export const defaultHabitSuggestions: Record<HabitCategory, string[]> = {
  nutrition: [
    "Drink 8 glasses of water",
    "Eat a colorful breakfast",
    "Have a serving of vegetables",
    "Mindful eating for one meal",
  ],
  movement: [
    "10-minute morning stretch",
    "Take a walk outside",
    "Dance to your favorite song",
    "Gentle yoga flow",
  ],
  supplements: [
    "Take daily vitamins",
    "Morning supplements",
    "Evening supplements",
    "Protein intake",
  ],
  hobbies: [
    "Read for 15 minutes",
    "Practice a creative skill",
    "Listen to a podcast",
    "Learn something new",
  ],
  self_care: [
    "Skincare routine",
    "Get 8 hours of sleep",
    "Take a relaxing bath",
    "Digital detox hour",
  ],
  reflection: [
    "Morning gratitude",
    "Evening journaling",
    "Weekly review",
    "Mood check-in",
  ],
};

// Starter habits by focus area (with icons for onboarding)
export const STARTER_HABITS: Record<FocusArea, { name: string; icon: string }[]> = {
  nutrition: [
    { name: 'Drink 8 glasses of water', icon: '💧' },
    { name: 'Eat a colorful breakfast', icon: '🍳' },
    { name: 'Have a serving of vegetables', icon: '🥗' },
    { name: 'Mindful eating for one meal', icon: '🧘' },
  ],
  movement: [
    { name: '10-minute morning stretch', icon: '🌅' },
    { name: 'Take a walk outside', icon: '🚶' },
    { name: 'Dance to your favorite song', icon: '💃' },
    { name: 'Gentle yoga flow', icon: '🧘' },
  ],
  supplements: [
    { name: 'Take daily vitamins', icon: '💊' },
    { name: 'Morning supplements', icon: '☀️' },
    { name: 'Evening supplements', icon: '🌙' },
    { name: 'Drink protein shake', icon: '🥤' },
  ],
  hobbies: [
    { name: 'Read for 15 minutes', icon: '📚' },
    { name: 'Practice a creative skill', icon: '🎨' },
    { name: 'Listen to a podcast', icon: '🎧' },
    { name: 'Learn something new', icon: '🧠' },
  ],
  self_care: [
    { name: 'Skincare routine', icon: '✨' },
    { name: 'Get 8 hours of sleep', icon: '😴' },
    { name: 'Take a relaxing bath', icon: '🛁' },
    { name: 'Digital detox hour', icon: '📵' },
  ],
  reflection: [
    { name: 'Morning gratitude', icon: '🙏' },
    { name: 'Evening journaling', icon: '📓' },
    { name: 'Weekly review', icon: '📋' },
    { name: 'Mood check-in', icon: '💭' },
  ],
};

// Mood options for reflections
export const moodOptions = [
  { emoji: '🌟', label: 'Glowing' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🤔', label: 'Reflective' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '💪', label: 'Motivated' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '🌱', label: 'Growing' },
];

// Supplement time of day labels
export const supplementTimeLabels: Record<SupplementTimeOfDay, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  anytime: 'Anytime',
};

// Supplement time of day icons (Lucide icon names)
export const supplementTimeIcons: Record<SupplementTimeOfDay, string> = {
  morning: 'sunrise',
  afternoon: 'sun',
  evening: 'moon',
  anytime: 'clock',
};

// Supplement completion messages
export const SUPPLEMENT_MESSAGES = {
  taken: [
    "Nourishing your body, one pill at a time",
    "Your body thanks you",
    "Supplements taken, glow activated",
    "Consistency is self-love",
    "Another step toward radiance",
  ],
  allTaken: [
    "All supplements taken! You're glowing",
    "Full supplement routine complete!",
    "Every vitamin accounted for, amazing!",
    "Your body is getting everything it needs",
    "Supplement queen! All done for today",
  ],
};

// Default supplement suggestions with dosages
export const defaultSupplementSuggestions: { name: string; dosage: string }[] = [
  { name: 'Vitamin D', dosage: '2000 IU' },
  { name: 'Omega-3', dosage: '1000 mg' },
  { name: 'Magnesium', dosage: '400 mg' },
  { name: 'Iron', dosage: '18 mg' },
  { name: 'Vitamin B12', dosage: '1000 mcg' },
  { name: 'Probiotics', dosage: '10B CFU' },
  { name: 'Vitamin C', dosage: '500 mg' },
  { name: 'Zinc', dosage: '15 mg' },
  { name: 'Biotin', dosage: '5000 mcg' },
  { name: 'Collagen', dosage: '10 g' },
];

// Weekly reflection prompts
export const reflectionPrompts = [
  "What made you feel most alive this week?",
  "What's one thing you're proud of accomplishing?",
  "How did you show yourself kindness?",
  "What habit brought you the most joy?",
  "What would you like to focus on next week?",
  "What are you grateful for today?",
  "How has your energy been lately?",
  "What's something you learned about yourself?",
];
