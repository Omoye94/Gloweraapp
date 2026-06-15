import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { getChallengeById, Challenge } from '../data/challenges';
import { useJourneyStore } from '../stores/useJourneyStore';

// ─── Types ──────────────────────────────────────────────────

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  status: 'active' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface UserChallengeDay {
  id: string;
  user_id: string;
  user_challenge_id: string;
  day_index: number;
  date: string; // YYYY-MM-DD
  tasks_done: boolean[];
  reflection_text: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ActiveChallengeInfo {
  userChallenge: UserChallenge;
  catalog: Challenge;
}

// ─── Helpers ────────────────────────────────────────────────

export function formatDateISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

function isLocalUser(userId: string): boolean {
  return !userId || userId === 'local';
}

export function allTasksDone(day: UserChallengeDay): boolean {
  return day.tasks_done.length > 0 && day.tasks_done.every(Boolean);
}

export function someTasksDone(day: UserChallengeDay): boolean {
  return day.tasks_done.some(Boolean);
}

// ─── Limits ─────────────────────────────────────────────────

/** Maximum number of challenges a user can have active at once. */
export const MAX_ACTIVE_CHALLENGES = 3;

// ─── Local (AsyncStorage) fallback ──────────────────────────

const ACTIVES_KEY = 'challenge:actives';
const LEGACY_ACTIVE_KEY = 'challenge:active';
const HISTORY_KEY = 'challenge:history';
const DAYS_KEY = (id: string) => `challenge_days:${id}`;

/**
 * Get all active challenges in local storage.
 * Migrates the legacy single-active key on first read.
 */
async function getLocalActives(): Promise<UserChallenge[]> {
  const raw = await AsyncStorage.getItem(ACTIVES_KEY);
  if (raw) return JSON.parse(raw) as UserChallenge[];

  // Migration from legacy single-active model
  const legacy = await AsyncStorage.getItem(LEGACY_ACTIVE_KEY);
  if (legacy) {
    const single = JSON.parse(legacy) as UserChallenge;
    if (single.status === 'active') {
      await AsyncStorage.setItem(ACTIVES_KEY, JSON.stringify([single]));
      await AsyncStorage.removeItem(LEGACY_ACTIVE_KEY);
      return [single];
    }
    await AsyncStorage.removeItem(LEGACY_ACTIVE_KEY);
  }

  return [];
}

async function setLocalActives(actives: UserChallenge[]): Promise<void> {
  if (actives.length === 0) {
    await AsyncStorage.removeItem(ACTIVES_KEY);
  } else {
    await AsyncStorage.setItem(ACTIVES_KEY, JSON.stringify(actives));
  }
}

async function addLocalActive(uc: UserChallenge): Promise<void> {
  const current = await getLocalActives();
  await setLocalActives([...current, uc]);
}

async function removeLocalActive(userChallengeId: string): Promise<UserChallenge | null> {
  const current = await getLocalActives();
  const removed = current.find((c) => c.id === userChallengeId) ?? null;
  await setLocalActives(current.filter((c) => c.id !== userChallengeId));
  return removed;
}

async function getLocalHistory(): Promise<UserChallenge[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? (JSON.parse(raw) as UserChallenge[]) : [];
}

async function getLocalDays(userChallengeId: string): Promise<UserChallengeDay[]> {
  const raw = await AsyncStorage.getItem(DAYS_KEY(userChallengeId));
  if (!raw) return [];
  const days = JSON.parse(raw) as any[];
  // Migrate legacy task_1_done/task_2_done → tasks_done
  return days.map((d) => {
    if (!Array.isArray(d.tasks_done)) {
      return {
        ...d,
        tasks_done: [!!d.task_1_done, !!d.task_2_done],
      } as UserChallengeDay;
    }
    return d as UserChallengeDay;
  });
}

async function setLocalDays(userChallengeId: string, days: UserChallengeDay[]): Promise<void> {
  await AsyncStorage.setItem(DAYS_KEY(userChallengeId), JSON.stringify(days));
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Get all active challenges for the user + catalog data, in start-date order.
 */
export async function getActiveChallenges(
  userId: string
): Promise<ActiveChallengeInfo[]> {
  try {
    let rows: UserChallenge[] = [];
    if (isLocalUser(userId)) {
      rows = (await getLocalActives()).filter((uc) => uc.status === 'active');
    } else {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: true });
      if (error) throw error;
      rows = (data || []) as UserChallenge[];
    }

    const out: ActiveChallengeInfo[] = [];
    for (const uc of rows) {
      const catalog = getChallengeById(uc.challenge_id);
      if (catalog) out.push({ userChallenge: uc, catalog });
    }
    return out;
  } catch (err) {
    console.error('[Challenges] getActiveChallenges error:', err);
    return [];
  }
}

/**
 * Legacy single-active getter — returns the FIRST active or null.
 * Kept for backward compatibility with screens that haven't been refactored
 * to handle multiple actives yet.
 */
export async function getActiveChallenge(
  userId: string
): Promise<ActiveChallengeInfo | null> {
  const all = await getActiveChallenges(userId);
  return all[0] ?? null;
}

/**
 * Whether the user can start another challenge right now (i.e. not at cap).
 */
export async function canStartChallenge(userId: string): Promise<boolean> {
  const actives = await getActiveChallenges(userId);
  return actives.length < MAX_ACTIVE_CHALLENGES;
}

/**
 * Abandon a specific active challenge by user_challenge id.
 */
export async function abandonChallenge(
  userId: string,
  userChallengeId: string
): Promise<void> {
  try {
    if (isLocalUser(userId)) {
      const removed = await removeLocalActive(userChallengeId);
      if (removed) {
        const abandoned = { ...removed, status: 'abandoned' as const };
        const history = await getLocalHistory();
        history.push(abandoned);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
      return;
    }

    await supabase
      .from('user_challenges')
      .update({ status: 'abandoned' })
      .eq('id', userChallengeId);
  } catch (err) {
    console.error('[Challenges] abandonChallenge error:', err);
  }
}

/**
 * @deprecated Use abandonChallenge(userId, userChallengeId) instead.
 * Abandons the FIRST active challenge (legacy single-active behavior).
 */
export async function abandonActiveChallenge(userId: string): Promise<void> {
  const actives = await getActiveChallenges(userId);
  if (actives.length === 0) return;
  await abandonChallenge(userId, actives[0].userChallenge.id);
}

/**
 * Start a new challenge. Returns null if at cap or on error.
 * Use `canStartChallenge(userId)` beforehand to show appropriate UI.
 */
export async function startChallenge(
  userId: string,
  challengeId: string
): Promise<UserChallenge | null> {
  const catalog = getChallengeById(challengeId);
  if (!catalog) return null;

  // Enforce the active-challenge cap. Caller should ideally check
  // `canStartChallenge()` first to show a friendly "at cap" modal,
  // but we double-check here as a safety net.
  const actives = await getActiveChallenges(userId);
  if (actives.length >= MAX_ACTIVE_CHALLENGES) {
    return null;
  }
  // Prevent starting the same challenge twice concurrently.
  if (actives.some((a) => a.userChallenge.challenge_id === challengeId)) {
    return null;
  }

  const today = formatDateISO();
  const endDate = addDays(today, catalog.duration - 1);

  try {
    if (isLocalUser(userId)) {
      const id = `local_${Date.now()}`;
      const uc: UserChallenge = {
        id,
        user_id: userId || 'local',
        challenge_id: challengeId,
        start_date: today,
        end_date: endDate,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await addLocalActive(uc);

      // Seed day rows
      const days: UserChallengeDay[] = [];
      for (let i = 0; i < catalog.duration; i++) {
        days.push({
          id: `${id}_day_${i}`,
          user_id: userId || 'local',
          user_challenge_id: id,
          day_index: i,
          date: addDays(today, i),
          tasks_done: new Array(catalog.tasks.length).fill(false),
          reflection_text: null,
          completed_at: null,
          created_at: new Date().toISOString(),
        });
      }
      await setLocalDays(id, days);
      return uc;
    }

    // Supabase path
    const { data: ucData, error: ucError } = await supabase
      .from('user_challenges')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        start_date: today,
        end_date: endDate,
        status: 'active',
      })
      .select()
      .single();

    if (ucError) throw ucError;
    const uc = ucData as UserChallenge;

    // Seed day rows
    const dayRows = [];
    for (let i = 0; i < catalog.duration; i++) {
      dayRows.push({
        user_id: userId,
        user_challenge_id: uc.id,
        day_index: i,
        date: addDays(today, i),
        tasks_done: new Array(catalog.tasks.length).fill(false),
      });
    }

    const { error: daysError } = await supabase
      .from('user_challenge_days')
      .insert(dayRows);

    if (daysError) throw daysError;

    return uc;
  } catch (err) {
    console.error('[Challenges] startChallenge error:', err);
    return null;
  }
}

/**
 * Fetch all day rows for a challenge.
 */
export async function getChallengeDays(
  userId: string,
  userChallengeId: string
): Promise<UserChallengeDay[]> {
  try {
    if (isLocalUser(userId)) {
      return await getLocalDays(userChallengeId);
    }

    const { data, error } = await supabase
      .from('user_challenge_days')
      .select('*')
      .eq('user_challenge_id', userChallengeId)
      .order('day_index', { ascending: true });

    if (error) throw error;
    return (data || []) as UserChallengeDay[];
  } catch (err) {
    console.error('[Challenges] getChallengeDays error:', err);
    return [];
  }
}

/**
 * Get today's challenge day row from an active challenge.
 */
export function getTodayChallengeDay(
  userChallenge: UserChallenge,
  days: UserChallengeDay[]
): UserChallengeDay | null {
  const today = formatDateISO();
  return days.find((d) => d.date === today) ?? null;
}

/**
 * Compute the current day index (0-based) from start_date.
 */
export function getCurrentDayIndex(userChallenge: UserChallenge): number {
  const today = formatDateISO();
  const start = new Date(userChallenge.start_date + 'T00:00:00');
  const now = new Date(today + 'T00:00:00');
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * Toggle a task by 0-based index. Sets completed_at when all tasks are done.
 */
export async function toggleTask(
  userId: string,
  dayId: string,
  taskIndex: number,
  currentDay: UserChallengeDay
): Promise<UserChallengeDay> {
  const newTasksDone = [...currentDay.tasks_done];
  newTasksDone[taskIndex] = !newTasksDone[taskIndex];

  const allDone = newTasksDone.every(Boolean);
  const completedAt = allDone ? new Date().toISOString() : null;

  const updated: UserChallengeDay = {
    ...currentDay,
    tasks_done: newTasksDone,
    completed_at: completedAt,
  };

  try {
    if (isLocalUser(userId)) {
      const days = await getLocalDays(currentDay.user_challenge_id);
      const newDays = days.map((d) => (d.id === dayId ? updated : d));
      await setLocalDays(currentDay.user_challenge_id, newDays);
      return updated;
    }

    const { error } = await supabase
      .from('user_challenge_days')
      .update({
        tasks_done: newTasksDone,
        completed_at: completedAt,
      })
      .eq('id', dayId);

    if (error) throw error;
    return updated;
  } catch (err) {
    console.error('[Challenges] toggleTask error:', err);
    return currentDay;
  }
}

/**
 * Save reflection text for a day.
 */
export async function saveReflection(
  userId: string,
  dayId: string,
  text: string,
  userChallengeId: string
): Promise<void> {
  try {
    if (isLocalUser(userId)) {
      const days = await getLocalDays(userChallengeId);
      const newDays = days.map((d) =>
        d.id === dayId ? { ...d, reflection_text: text } : d
      );
      await setLocalDays(userChallengeId, newDays);
      return;
    }

    const { error } = await supabase
      .from('user_challenge_days')
      .update({ reflection_text: text })
      .eq('id', dayId);

    if (error) throw error;
  } catch (err) {
    console.error('[Challenges] saveReflection error:', err);
  }
}

/**
 * Complete the challenge (set status='completed').
 */
export async function completeChallenge(
  userId: string,
  userChallengeId: string
): Promise<void> {
  try {
    if (isLocalUser(userId)) {
      const removed = await removeLocalActive(userChallengeId);
      if (removed) {
        const completed = { ...removed, status: 'completed' as const };
        const history = await getLocalHistory();
        history.push(completed);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

        const catalog = getChallengeById(removed.challenge_id);
        useJourneyStore.getState().addEvent({
          user_id: userId || 'local',
          event_type: 'challenge_completed',
          title: `Completed: ${catalog?.name || 'Challenge'}`,
          description: catalog?.description || null,
          icon: '🏆',
        });
      }
      return;
    }

    const { error } = await supabase
      .from('user_challenges')
      .update({ status: 'completed' })
      .eq('id', userChallengeId);

    if (error) throw error;

    // Log journey event for Supabase path
    const uc = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('id', userChallengeId)
      .maybeSingle();
    if (uc.data) {
      const catalog = getChallengeById(uc.data.challenge_id);
      useJourneyStore.getState().addEvent({
        user_id: userId,
        event_type: 'challenge_completed',
        title: `Completed: ${catalog?.name || 'Challenge'}`,
        description: catalog?.description || null,
        icon: '🏆',
      });
    }
  } catch (err) {
    console.error('[Challenges] completeChallenge error:', err);
  }
}

/**
 * Get IDs of challenges the user has completed.
 */
export async function getCompletedChallengeIds(
  userId: string
): Promise<string[]> {
  try {
    if (isLocalUser(userId)) {
      const history = await getLocalHistory();
      return history
        .filter((uc) => uc.status === 'completed')
        .map((uc) => uc.challenge_id);
    }

    const { data, error } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) throw error;
    return (data || []).map((r: { challenge_id: string }) => r.challenge_id);
  } catch (err) {
    console.error('[Challenges] getCompletedChallengeIds error:', err);
    return [];
  }
}
