import { CompletionType, HabitCompletion } from '../types/habit';
import { GrowthStage, GROWTH_THRESHOLDS, STAGE_ORDER } from '../types/plant';

// Point values for different actions
export const POINT_VALUES = {
  showUpBonus: 3,
  habitGentleCompletion: 3,
  habitFullCompletion: 6,
  fullDayBonus: 8,
  journalEntry: 5,
  dailyReflection: 5,
  weeklyReflection: 7,
  challengeDayComplete: 6,
  challengeFullComplete: 30,
} as const;

// Daily cap on action-based points (show-up and streak bonuses are uncapped)
export const DAILY_ACTION_CAP = 40;

// Streak milestone bonuses (one-time awards when milestone is first reached)
export const STREAK_MILESTONES = [
  { days: 3, bonus: 10 },
  { days: 7, bonus: 25 },
  { days: 14, bonus: 50 },
  { days: 21, bonus: 75 },
  { days: 30, bonus: 120 },
  { days: 60, bonus: 200 },
  { days: 90, bonus: 300 },
  { days: 180, bonus: 500 },
  { days: 365, bonus: 1000 },
] as const;

// Show-up bonus scales with current streak length
export const SHOW_UP_BONUS_TIERS = [
  { minStreak: 30, bonus: 6 },
  { minStreak: 14, bonus: 5 },
  { minStreak: 7, bonus: 4 },
  { minStreak: 0, bonus: 3 },
] as const;

// Get show-up bonus based on current streak
export const getShowUpBonus = (currentStreak: number): number => {
  for (const tier of SHOW_UP_BONUS_TIERS) {
    if (currentStreak >= tier.minStreak) return tier.bonus;
  }
  return POINT_VALUES.showUpBonus;
};

// Calculate action points with daily cap enforcement
export const calculateCappedActionPoints = (
  pointsToAdd: number,
  currentDayActionPoints: number
): number => {
  const remaining = Math.max(0, DAILY_ACTION_CAP - currentDayActionPoints);
  return Math.min(pointsToAdd, remaining);
};

// Get newly hit streak milestones that haven't been awarded yet
export const getNewStreakMilestones = (
  newStreak: number,
  alreadyHitMilestones: number[]
): { days: number; bonus: number }[] => {
  return STREAK_MILESTONES.filter(
    m => newStreak >= m.days && !alreadyHitMilestones.includes(m.days)
  );
};

// Calculate prestige points (points above glow threshold)
export const getPrestigePoints = (totalPoints: number): number => {
  return Math.max(0, totalPoints - GROWTH_THRESHOLDS.glow);
};

// Calculate points for habit completion
export const calculateHabitPoints = (type: CompletionType): number => {
  return type === 'full'
    ? POINT_VALUES.habitFullCompletion
    : POINT_VALUES.habitGentleCompletion;
};

// Calculate bonus for completing all habits fully
export const calculateDailyBonus = (
  completions: HabitCompletion[],
  totalActiveHabits: number
): number => {
  if (totalActiveHabits === 0) return 0;

  const fullCompletions = completions.filter(c => c.completionType === 'full');
  if (fullCompletions.length === totalActiveHabits) {
    return POINT_VALUES.fullDayBonus;
  }
  return 0;
};

// Determine growth stage based on total points
export const getGrowthStage = (totalPoints: number): GrowthStage => {
  if (totalPoints >= GROWTH_THRESHOLDS.glow) return 'glow';
  if (totalPoints >= GROWTH_THRESHOLDS.bloom) return 'bloom';
  if (totalPoints >= GROWTH_THRESHOLDS.bud) return 'bud';
  if (totalPoints >= GROWTH_THRESHOLDS.sprout) return 'sprout';
  return 'seed';
};

// Get progress percentage to next stage
export const getProgressToNextStage = (totalPoints: number): number => {
  const currentStage = getGrowthStage(totalPoints);
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  // If at max stage, return 100%
  if (currentStage === 'glow') return 100;

  const nextStage = STAGE_ORDER[currentIndex + 1];
  const currentThreshold = GROWTH_THRESHOLDS[currentStage];
  const nextThreshold = GROWTH_THRESHOLDS[nextStage];

  const pointsInStage = totalPoints - currentThreshold;
  const stageRange = nextThreshold - currentThreshold;

  return Math.min(Math.round((pointsInStage / stageRange) * 100), 100);
};

// Get points needed for next stage
export const getPointsToNextStage = (totalPoints: number): number => {
  const currentStage = getGrowthStage(totalPoints);

  if (currentStage === 'glow') return 0;

  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const nextStage = STAGE_ORDER[currentIndex + 1];
  const nextThreshold = GROWTH_THRESHOLDS[nextStage];

  return Math.max(nextThreshold - totalPoints, 0);
};

// Calculate total points for a day
export const calculateDailyTotal = (
  completions: HabitCompletion[],
  totalActiveHabits: number
): number => {
  const completionPoints = completions.reduce((sum, c) => sum + c.pointsEarned, 0);
  const bonus = calculateDailyBonus(completions, totalActiveHabits);
  return completionPoints + bonus;
};

// Calculate completion percentage for today
export const calculateDailyProgress = (
  completedCount: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
};
