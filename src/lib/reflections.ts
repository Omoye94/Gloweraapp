import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

// 20 gentle daily reflection prompts
const DAILY_PROMPTS = [
  "What's one small thing that brought you peace today?",
  "How did you show yourself kindness today?",
  "What are you grateful for in this moment?",
  "What made you smile today, even briefly?",
  "How did your body feel today? What did it need?",
  "What's one thing you accomplished, no matter how small?",
  "Who or what brought you comfort today?",
  "What boundary did you honor today?",
  "What's one thing you're proud of about yourself?",
  "How did you nurture yourself today?",
  "What's something beautiful you noticed today?",
  "What emotion visited you most today?",
  "What's one thing you'd like to let go of?",
  "How did you practice patience today?",
  "What's something you're looking forward to?",
  "What lesson did today gently teach you?",
  "How did you move your body today?",
  "What's one thing that feels lighter now?",
  "What intention do you want to carry forward?",
  "How can you be gentler with yourself tomorrow?",
];

// Mood options for the reflection
export const REFLECTION_MOODS = [
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'proud', label: 'Proud', emoji: '🥹' },
  { id: 'content', label: 'Content', emoji: '☺️' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '😮‍💨' },
  { id: 'hopeful', label: 'Hopeful', emoji: '🌟' },
] as const;

export type ReflectionMood = typeof REFLECTION_MOODS[number]['id'];

export interface DailyReflection {
  id: string;
  user_id: string;
  reflection_date: string;
  prompt_text: string;
  mood: string | null;
  content: string | null;
  audioUri?: string; // local-only, not synced to Supabase
  created_at: string;
  updated_at: string;
}

export interface DailyReflectionPayload {
  user_id: string;
  reflection_date: string;
  prompt_text: string;
  mood: string | null;
  content: string | null;
}

/**
 * Get today's date in local timezone as ISO string (YYYY-MM-DD)
 */
export function getLocalDateISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the day of year (1-366) for a given date
 */
function getDayOfYear(dateISO: string): number {
  const date = new Date(dateISO);
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Get a deterministic prompt for a given date
 * Uses day-of-year mod prompt count for consistent daily prompts
 */
export function getPromptForDate(dateISO: string): string {
  const dayOfYear = getDayOfYear(dateISO);
  const promptIndex = dayOfYear % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[promptIndex];
}

/**
 * Get the AsyncStorage cache key for a reflection date
 */
function getCacheKey(dateISO: string): string {
  return `daily_reflection:${dateISO}`;
}

/**
 * Get cached reflection from AsyncStorage
 */
export async function getCachedReflection(dateISO: string): Promise<DailyReflection | null> {
  try {
    const cached = await AsyncStorage.getItem(getCacheKey(dateISO));
    if (cached) {
      return JSON.parse(cached) as DailyReflection;
    }
    return null;
  } catch (error) {
    console.error('[Reflections] Error reading cache:', error);
    return null;
  }
}

/**
 * Cache a reflection to AsyncStorage
 */
async function cacheReflection(reflection: DailyReflection): Promise<void> {
  try {
    await AsyncStorage.setItem(
      getCacheKey(reflection.reflection_date),
      JSON.stringify(reflection)
    );
  } catch (error) {
    console.error('[Reflections] Error caching reflection:', error);
  }
}

/**
 * Fetch daily reflection from Supabase for a specific date
 * If userId is 'local', only checks local cache
 */
export async function getDailyReflection(
  userId: string,
  dateISO: string
): Promise<DailyReflection | null> {
  try {
    // Try cache first for fast load
    const cached = await getCachedReflection(dateISO);

    // If local user, only use cache
    if (userId === 'local') {
      return cached;
    }

    if (cached && cached.user_id === userId) {
      // Return cached but also fetch fresh in background
      fetchAndCacheReflection(userId, dateISO).catch(console.error);
      return cached;
    }

    // Fetch from Supabase
    return await fetchAndCacheReflection(userId, dateISO);
  } catch (error) {
    console.error('[Reflections] Error getting daily reflection:', error);
    return null;
  }
}

/**
 * Fetch from Supabase and cache
 */
async function fetchAndCacheReflection(
  userId: string,
  dateISO: string
): Promise<DailyReflection | null> {
  const { data, error } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('reflection_date', dateISO)
    .single();

  if (error) {
    // No row found is not an error for our use case
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  if (data) {
    const reflection = data as DailyReflection;
    await cacheReflection(reflection);
    return reflection;
  }

  return null;
}

/**
 * Save (upsert) a daily reflection
 * Inserts if new, updates if exists for that date
 * If userId is null, saves locally only
 */
export async function saveDailyReflection(
  payload: DailyReflectionPayload
): Promise<DailyReflection | null> {
  const now = new Date().toISOString();

  // If no user_id, save locally only
  if (!payload.user_id) {
    const localReflection: DailyReflection = {
      id: `local_${payload.reflection_date}`,
      user_id: 'local',
      reflection_date: payload.reflection_date,
      prompt_text: payload.prompt_text,
      mood: payload.mood,
      content: payload.content,
      created_at: now,
      updated_at: now,
    };
    await cacheReflection(localReflection);
    console.log('[Reflections] Saved locally (not authenticated)');
    return localReflection;
  }

  try {
    const { data, error } = await supabase
      .from('daily_reflections')
      .upsert(
        {
          user_id: payload.user_id,
          reflection_date: payload.reflection_date,
          prompt_text: payload.prompt_text,
          mood: payload.mood,
          content: payload.content,
          updated_at: now,
        },
        {
          onConflict: 'user_id,reflection_date',
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      const reflection = data as DailyReflection;
      await cacheReflection(reflection);
      return reflection;
    }

    return null;
  } catch (error) {
    console.error('[Reflections] Error saving reflection:', error);
    throw error;
  }
}

/**
 * Check if user has completed today's reflection
 */
export async function hasCompletedTodayReflection(userId: string): Promise<boolean> {
  const today = getLocalDateISO();
  const reflection = await getDailyReflection(userId, today);
  return reflection !== null && reflection.content !== null && reflection.content.trim() !== '';
}

/**
 * Get recent reflections for display (last 7 days)
 */
export async function getRecentReflections(
  userId: string,
  limit: number = 7
): Promise<DailyReflection[]> {
  try {
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .order('reflection_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data || []) as DailyReflection[];
  } catch (error) {
    console.error('[Reflections] Error getting recent reflections:', error);
    return [];
  }
}
