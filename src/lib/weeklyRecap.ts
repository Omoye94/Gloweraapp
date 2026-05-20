import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { DailyReflection, REFLECTION_MOODS } from './reflections';

export interface WeeklyStats {
  daysReflected: number;
  totalDays: number;
  mostCommonMood: string | null;
  moodEmoji: string | null;
  snippets: string[];
}

export interface WeeklyRecapPayload {
  user_id: string;
  week_start: string;
  week_end: string;
  prompt_text: string;
  content: string | null;
}

const WEEKLY_PROMPT = "What helped you show up this week?";

/**
 * Get the Monday of the week containing the given date (local time)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust to Monday (day 0 = Sunday, so Monday = 1)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the Sunday of the week (6 days after Monday)
 */
export function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Format date as ISO string (YYYY-MM-DD) in local time
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Fetch daily reflections for a given week
 */
export async function fetchDailyForWeek(
  userId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<DailyReflection[]> {
  const startISO = formatDateISO(weekStart);
  const endISO = formatDateISO(weekEnd);

  // If local user, check cache for each day
  if (userId === 'local') {
    const entries: DailyReflection[] = [];
    const current = new Date(weekStart);

    while (current <= weekEnd) {
      const dateISO = formatDateISO(current);
      const cached = await AsyncStorage.getItem(`daily_reflection:${dateISO}`);
      if (cached) {
        try {
          entries.push(JSON.parse(cached));
        } catch (e) {
          // Skip invalid cache entries
        }
      }
      current.setDate(current.getDate() + 1);
    }
    return entries;
  }

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('reflection_type', 'daily')
    .gte('reflection_date', startISO)
    .lte('reflection_date', endISO)
    .order('reflection_date', { ascending: true });

  if (error) {
    console.error('[WeeklyRecap] Error fetching daily reflections:', error);
    return [];
  }

  return (data || []) as DailyReflection[];
}

/**
 * Compute the most common mood from entries
 */
export function computeMoodMode(entries: DailyReflection[]): { mood: string | null; emoji: string | null } {
  const moodCounts: Record<string, number> = {};

  for (const entry of entries) {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
  }

  let maxMood: string | null = null;
  let maxCount = 0;

  for (const [mood, count] of Object.entries(moodCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxMood = mood;
    }
  }

  if (maxMood) {
    const moodData = REFLECTION_MOODS.find(m => m.id === maxMood);
    return {
      mood: moodData?.label || maxMood,
      emoji: moodData?.emoji || null,
    };
  }

  return { mood: null, emoji: null };
}

/**
 * Pick up to 3 snippets from daily content (truncated to 60 chars)
 */
export function pickSnippets(entries: DailyReflection[], maxCount: number = 3): string[] {
  const snippets: string[] = [];

  for (const entry of entries) {
    if (entry.content && entry.content.trim()) {
      const text = entry.content.trim();
      const truncated = text.length > 60 ? text.substring(0, 57) + '...' : text;
      snippets.push(truncated);

      if (snippets.length >= maxCount) break;
    }
  }

  return snippets;
}

/**
 * Compute weekly stats from daily entries
 */
export function computeWeeklyStats(entries: DailyReflection[]): WeeklyStats {
  const { mood, emoji } = computeMoodMode(entries);
  const snippets = pickSnippets(entries);

  return {
    daysReflected: entries.length,
    totalDays: 7,
    mostCommonMood: mood,
    moodEmoji: emoji,
    snippets,
  };
}

/**
 * Get the weekly prompt
 */
export function getWeeklyPrompt(): string {
  return WEEKLY_PROMPT;
}

/**
 * Check if a weekly recap exists for the given week
 */
export async function getWeeklyRecap(
  userId: string,
  weekStart: Date
): Promise<DailyReflection | null> {
  const startISO = formatDateISO(weekStart);
  const cacheKey = `weekly_reflection:${startISO}`;

  // If local user, check cache
  if (userId === 'local') {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Fetch from Supabase
  const { data, error } = await supabase
    .from('daily_reflections')
    .select('*')
    .eq('user_id', userId)
    .eq('reflection_type', 'weekly')
    .eq('period_start', startISO)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No row found
      return null;
    }
    console.error('[WeeklyRecap] Error fetching weekly recap:', error);
    return null;
  }

  return data as DailyReflection;
}

/**
 * Save (upsert) a weekly recap
 */
export async function saveWeeklyRecap(
  payload: WeeklyRecapPayload
): Promise<DailyReflection | null> {
  const now = new Date().toISOString();
  const cacheKey = `weekly_reflection:${payload.week_start}`;

  // If no user_id, save locally only
  if (!payload.user_id || payload.user_id === 'local') {
    const localRecap: DailyReflection = {
      id: `local_weekly_${payload.week_start}`,
      user_id: 'local',
      reflection_date: payload.week_start,
      prompt_text: payload.prompt_text,
      mood: null,
      content: payload.content,
      created_at: now,
      updated_at: now,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(localRecap));
    console.log('[WeeklyRecap] Saved locally (not authenticated)');
    return localRecap;
  }

  try {
    const { data, error } = await supabase
      .from('daily_reflections')
      .upsert(
        {
          user_id: payload.user_id,
          reflection_date: payload.week_start, // Use week_start as reflection_date
          reflection_type: 'weekly',
          period_start: payload.week_start,
          period_end: payload.week_end,
          prompt_text: payload.prompt_text,
          mood: null,
          content: payload.content,
          updated_at: now,
        },
        {
          onConflict: 'user_id,reflection_type,period_start',
        }
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      const recap = data as DailyReflection;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(recap));
      return recap;
    }

    return null;
  } catch (error) {
    console.error('[WeeklyRecap] Error saving weekly recap:', error);
    throw error;
  }
}

/**
 * Format week range for display (e.g., "Feb 5 - 11")
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}
