import { Habit, HabitCategory } from '../types/habit';

export interface DefaultHabit {
  name: string;
  category: HabitCategory;
  icon: string;
}

export const DEFAULT_HABITS: DefaultHabit[] = [
  // Nutrition
  { name: 'Drink 8 glasses of water', category: 'nutrition', icon: '💧' },
  { name: 'Eat a serving of vegetables', category: 'nutrition', icon: '🥗' },
  { name: 'Have a balanced breakfast', category: 'nutrition', icon: '🍳' },
  { name: 'Mindful eating moment', category: 'nutrition', icon: '🍽️' },

  // Movement
  { name: '10-minute walk', category: 'movement', icon: '🚶‍♀️' },
  { name: 'Stretching routine', category: 'movement', icon: '🧘' },
  { name: '15-minute workout', category: 'movement', icon: '💪' },
  { name: 'Dance break', category: 'movement', icon: '💃' },

  // Supplements
  { name: 'Take daily vitamins', category: 'supplements', icon: '💊' },
  { name: 'Probiotics', category: 'supplements', icon: '🦠' },
  { name: 'Omega-3 / Fish oil', category: 'supplements', icon: '🐟' },

  // Hobbies
  { name: 'Read for 20 minutes', category: 'hobbies', icon: '📚' },
  { name: 'Creative time', category: 'hobbies', icon: '🎨' },
  { name: 'Learn something new', category: 'hobbies', icon: '🧠' },
  { name: 'Play music', category: 'hobbies', icon: '🎵' },

  // Self-care
  { name: 'Skincare routine', category: 'self-care', icon: '✨' },
  { name: 'Get 7+ hours of sleep', category: 'self-care', icon: '😴' },
  { name: 'Digital detox hour', category: 'self-care', icon: '📵' },
  { name: 'Take a relaxing bath', category: 'self-care', icon: '🛁' },

  // Reflection
  { name: 'Morning gratitude', category: 'reflection', icon: '🙏' },
  { name: '5-minute meditation', category: 'reflection', icon: '🧘‍♀️' },
  { name: 'Journal entry', category: 'reflection', icon: '📝' },
  { name: 'Evening reflection', category: 'reflection', icon: '🌙' },
];

export const HABIT_CATEGORIES: { id: HabitCategory; name: string; icon: string; color: string }[] = [
  { id: 'nutrition', name: 'Nutrition', icon: '🥗', color: '#FF99B5' },
  { id: 'movement', name: 'Movement', icon: '🏃‍♀️', color: '#66EFC7' },
  { id: 'supplements', name: 'Supplements', icon: '💊', color: '#FFD699' },
  { id: 'hobbies', name: 'Hobbies', icon: '🎨', color: '#C9ADFF' },
  { id: 'self-care', name: 'Self-Care', icon: '✨', color: '#99D6FF' },
  { id: 'reflection', name: 'Reflection', icon: '🌙', color: '#FFB3C7' },
];

export const getHabitsByCategory = (category: HabitCategory): DefaultHabit[] => {
  return DEFAULT_HABITS.filter(habit => habit.category === category);
};

export const getCategoryInfo = (category: HabitCategory) => {
  return HABIT_CATEGORIES.find(c => c.id === category);
};
