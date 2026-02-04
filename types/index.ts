// User types
export interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  focus_areas: FocusArea[];
  reminder_preference: ReminderPreference;
  onboarding_completed: boolean;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export type FocusArea =
  | 'nutrition'
  | 'movement'
  | 'supplements'
  | 'hobbies'
  | 'self_care'
  | 'reflection';

export type ReminderPreference = 'gentle' | 'minimal' | 'none';

// Habit types
export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: HabitCategory;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  custom_days: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type HabitCategory = FocusArea;

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type CompletionType = 'gently' | 'fully';

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  completion_type: CompletionType;
  points_earned: number;
}

// Plant/Garden types
export type PlantGrowthStage = 'seed' | 'sprout' | 'bud' | 'bloom' | 'glow';

export interface Plant {
  id: string;
  user_id: string;
  name: string;
  plant_type: string;
  growth_stage: PlantGrowthStage;
  growth_points: number;
  created_at: string;
  updated_at: string;
}

// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  habit_prompts: ChallengePrompt[];
  is_active: boolean;
  created_at: string;
}

export interface ChallengePrompt {
  day: number;
  prompt: string;
  category?: HabitCategory;
}

export interface ChallengeParticipation {
  id: string;
  user_id: string;
  challenge_id: string;
  started_at: string;
  completed_at: string | null;
  days_completed: number;
}

// Reflection types
export interface Reflection {
  id: string;
  user_id: string;
  content: string;
  mood: string | null;
  prompt: string | null;
  created_at: string;
}

// Community types
export interface CommunityPod {
  id: string;
  name: string;
  max_members: number;
  created_at: string;
}

export interface PodMembership {
  id: string;
  pod_id: string;
  user_id: string;
  display_name: string | null;
  joined_at: string;
}

export interface PodMessage {
  id: string;
  pod_id: string;
  user_id: string;
  content: string;
  emoji_reactions: Record<string, string[]>;
  created_at: string;
}

// Points types
export type PointSource =
  | 'habit_gently'
  | 'habit_fully'
  | 'daily_complete'
  | 'challenge'
  | 'reflection';

export interface PointsLedger {
  id: string;
  user_id: string;
  points: number;
  source: PointSource;
  reference_id: string | null;
  created_at: string;
}

// UI Types
export interface OnboardingData {
  focusAreas: FocusArea[];
  habitCount: number;
  reminderPreference: ReminderPreference;
}
