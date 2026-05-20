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

// ─── Local (AsyncStorage) fallback ──────────────────────────

const ACTIVE_KEY = 'challenge:active';
const HISTORY_KEY = 'challenge:history';
const DAYS_KEY = (id: string) => `challenge_days:${id}`;

async function getLocalActive(): Promise<UserChallenge | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_KEY);
  return raw ? (JSON.parse(raw) as UserChallenge) : null;
}

async function setLocalActive(uc: UserChallenge | null): Promise<void> {
  if (uc) {
    await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(uc));
  } else {
    await AsyncStorage.removeItem(ACTIVE_KEY);
  }
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
 * Get the user's active challenge + catalog data.
 */
export async function getActiveChallenge(
  userId: string
): Promise<ActiveChallengeInfo | null> {
  try {
    if (isLocalUser(userId)) {
      const uc = await getLocalActive();
      if (!uc || uc.status !== 'active') return null;
      const catalog = getChallengeById(uc.challenge_id);
      if (!catalog) return null;
      return { userChallenge: uc, catalog };
    }

    const { data, error } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const uc = data as UserChallenge;
    const catalog = getChallengeById(uc.challenge_id);
    if (!catalog) return null;
    return { userChallenge: uc, catalog };
  } catch (err) {
    console.error('[Challenges] getActiveChallenge error:', err);
    return null;
  }
}

/**
 * Abandon the currently active challenge.
 */
export async function abandonActiveChallenge(userId: string): Promise<void> {
  try {
    if (isLocalUser(userId)) {
      const uc = await getLocalActive();
      if (uc && uc.status === 'active') {
        const abandoned = { ...uc, status: 'abandoned' as const };
        await setLocalActive(null);
        const history = await getLocalHistory();
        history.push(abandoned);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      }
      return;
    }

    await supabase
      .from('user_challenges')
      .update({ status: 'abandoned' })
      .eq('user_id', userId)
      .eq('status', 'active');
  } catch (err) {
    console.error('[Challenges] abandonActiveChallenge error:', err);
  }
}

/**
 * Start a new challenge. Abandons current active if exists.
 * Returns the new UserChallenge.
 */
export async function startChallenge(
  userId: string,
  challengeId: string
): Promise<UserChallenge | null> {
  const catalog = getChallengeById(challengeId);
  if (!catalog) return null;

  const today = formatDateISO();
  const endDate = addDays(today, catalog.duration - 1);

  try {
    // Abandon current active challenge first
    await abandonActiveChallenge(userId);

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
      await setLocalActive(uc);

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
      const uc = await getLocalActive();
      if (uc && uc.id === userChallengeId) {
        const completed = { ...uc, status: 'completed' as const };
        // Clear active
        await setLocalActive(null);
        // Persist to history
        const history = await getLocalHistory();
        history.push(completed);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

        const catalog = getChallengeById(uc.challenge_id);
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
