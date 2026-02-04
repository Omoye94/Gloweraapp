import { clsx, type ClassValue } from 'clsx';
import { format, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { POINTS, PLANT_GROWTH_THRESHOLDS, COMPLETION_MESSAGES } from './constants';
import { CompletionType, PlantGrowthStage } from '../types';

// Utility for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Get random item from array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get completion message
export function getCompletionMessage(type: CompletionType): string {
  return getRandomItem(COMPLETION_MESSAGES[type]);
}

// Get daily complete message
export function getDailyCompleteMessage(): string {
  return getRandomItem(COMPLETION_MESSAGES.dailyComplete);
}

// Calculate points for habit completion
export function calculatePoints(completionType: CompletionType): number {
  return completionType === 'fully' ? POINTS.HABIT_FULLY : POINTS.HABIT_GENTLY;
}

// Get plant growth stage from points
export function getPlantStage(points: number): PlantGrowthStage {
  if (points >= PLANT_GROWTH_THRESHOLDS.glow) return 'glow';
  if (points >= PLANT_GROWTH_THRESHOLDS.bloom) return 'bloom';
  if (points >= PLANT_GROWTH_THRESHOLDS.bud) return 'bud';
  if (points >= PLANT_GROWTH_THRESHOLDS.sprout) return 'sprout';
  return 'seed';
}

// Get progress to next stage (0-100)
export function getProgressToNextStage(points: number): number {
  const currentStage = getPlantStage(points);
  const stages: PlantGrowthStage[] = ['seed', 'sprout', 'bud', 'bloom', 'glow'];
  const currentIndex = stages.indexOf(currentStage);

  if (currentStage === 'glow') return 100;

  const nextStage = stages[currentIndex + 1];
  const currentThreshold = PLANT_GROWTH_THRESHOLDS[currentStage];
  const nextThreshold = PLANT_GROWTH_THRESHOLDS[nextStage];

  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';

  return format(d, 'EEEE, MMM d');
}

// Format date for database
export function formatDateForDB(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Get days of current week
export function getCurrentWeekDays(): Date[] {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 });

  return eachDayOfInterval({ start, end });
}

// Calculate glow meter percentage (habits completed today)
export function calculateGlowMeter(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Generate a soft pastel color
export function generateSoftColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 85%)`;
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Delay utility for animations
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get ordinal suffix (1st, 2nd, 3rd, etc.)
export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Calculate streak (consecutive days with at least one habit completed)
export function calculateStreak(completionDates: string[]): number {
  if (completionDates.length === 0) return 0;

  const sortedDates = [...completionDates]
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = today;

  for (const date of sortedDates) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      currentDate = dateOnly;
    } else {
      break;
    }
  }

  return streak;
}
