import { CompletionType, HabitCompletion } from '../types/habit';
import { GrowthStage, GROWTH_THRESHOLDS, STAGE_ORDER } from '../types/plant';

// Point values for different actions
export const POINT_VALUES = {
  habitGentleCompletion: 5,
  habitFullCompletion: 10,
  fullDayBonus: 15,
  journalEntry: 8,
  weeklyReflection: 12,
  challengeDayComplete: 10,
  challengeFullComplete: 50,
} as const;

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
