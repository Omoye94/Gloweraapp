import { PlantMood, StreakData } from '../types/plant';
import { formatDateKey } from './dateUtils';

export interface PlantMoodInputs {
  streak: StreakData;
  todaysProgressPercent: number;
}

export function getPlantMood({ streak, todaysProgressPercent }: PlantMoodInputs): PlantMood {
  const today = formatDateKey();
  const yesterday = formatDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const last = streak.lastActiveDate;

  if (streak.currentStreak >= 7 && todaysProgressPercent >= 50) return 'glowing';
  if (todaysProgressPercent > 0) return 'happy';
  if (last === today || last === yesterday) return 'sleepy';
  return 'wilting';
}
