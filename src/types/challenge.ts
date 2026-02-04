import { HabitCategory } from './habit';

export interface ChallengeTask {
  day: number; // 1-14
  description: string;
  habitId?: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: number; // Days (7 or 14)
  category: HabitCategory;
  dailyTasks: ChallengeTask[];
  pointsReward: number;
  icon: string;
}

export type ChallengeStatus = 'active' | 'completed' | 'abandoned';

export interface UserChallenge {
  id: string;
  challengeId: string;
  startDate: string; // YYYY-MM-DD
  status: ChallengeStatus;
  completedDays: number[]; // Array of completed day numbers
  pointsEarned: number;
  completedAt?: string;
}
