import { SupplementMetadata } from './supplement';

export type HabitCategory =
  | 'nutrition'
  | 'movement'
  | 'supplements'
  | 'hobbies'
  | 'self-care'
  | 'reflection';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  icon: string;
  isCustom: boolean;
  isActive: boolean;
  createdAt: string;
  order: number;
  supplementMeta?: SupplementMetadata; // Optional supplement-specific data
}

export type CompletionType = 'gentle' | 'full';

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completionType: CompletionType;
  completedAt: string; // ISO timestamp
  pointsEarned: number;
}

export interface DailyHabitSummary {
  date: string; // YYYY-MM-DD
  completions: Record<string, HabitCompletion>;
  totalPoints: number;
  isFullDay: boolean;
}
