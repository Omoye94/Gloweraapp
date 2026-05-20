export {
  getCachedSettings,
  cacheSettings,
  clearCachedSettings,
  fetchUserSettings,
  updateUserSettings,
  getUserSettings,
  completeOnboarding,
} from './userSettings';
export type { UserSettings, UserSettingsUpdate } from './userSettings';

export {
  getLocalDateISO,
  getPromptForDate,
  getDailyReflection,
  saveDailyReflection,
  hasCompletedTodayReflection,
  getRecentReflections,
  getCachedReflection,
  REFLECTION_MOODS,
} from './reflections';
export type { DailyReflection, DailyReflectionPayload, ReflectionMood } from './reflections';

export {
  getActiveChallenge,
  startChallenge,
  abandonActiveChallenge,
  getChallengeDays,
  getTodayChallengeDay,
  getCurrentDayIndex,
  toggleTask,
  saveReflection as saveChallengeReflection,
  completeChallenge,
  getCompletedChallengeIds,
  formatDateISO,
  allTasksDone,
  someTasksDone,
} from './challenges';
export type { UserChallenge, UserChallengeDay, ActiveChallengeInfo } from './challenges';
