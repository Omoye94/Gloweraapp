import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { DailyReflection, REFLECTION_MOODS } from './reflections';

export type HistoryFilter = 'week' | 'month' | 'all';

export interface PaginatedReflections {
  data: DailyReflection[];
  nextCursor: string | null;
  hasMore: boolean;
}

const PAGE_SIZE = 30;

/**
 * Get the start of the week (Monday) for a given date
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the start of the month for a given date
 */
export function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "Mon, Feb 10")
 */
export function formatDateDisplay(dateISO: string): string {
  const date = new Date(dateISO + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get mood info by ID
 */
export function getMoodInfo(moodId: string | null): { label: string; emoji: string } | null {
  if (!moodId) return null;
  const mood = REFLECTION_MOODS.find(m => m.id === moodId);
  return mood ? { label: mood.label, emoji: mood.emoji } : null;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string | null, maxLength: number = 80): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.substring(0, maxLength - 3) + '...';
}

/**
 * Get cache key for a reflection
 */
function getCacheKey(dateISO: string): string {
  return `daily_reflection:${dateISO}`;
}

/**
 * Fetch reflections with pagination and filtering
 */
export async function fetchReflections(
  userId: string,
  filter: HistoryFilter,
  cursor?: string
): Promise<PaginatedReflections> {
  // For local users, fetch from cache
  if (userId === 'local') {
    return fetchLocalReflections(filter);
  }

  try {
    let query = supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', userId)
      .eq('reflection_type', 'daily')
      .order('reflection_date', { ascending: false })
      .limit(PAGE_SIZE);

    // Apply date filter
    const now = new Date();
    if (filter === 'week') {
      const weekStart = getStartOfWeek(now);
      query = query.gte('reflection_date', formatDateISO(weekStart));
    } else if (filter === 'month') {
      const monthStart = getStartOfMonth(now);
      query = query.gte('reflection_date', formatDateISO(monthStart));
    }

    // Apply cursor for pagination
    if (cursor) {
      query = query.lt('reflection_date', cursor);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ReflectionHistory] Error fetching:', error);
      return { data: [], nextCursor: null, hasMore: false };
    }

    const reflections = (data || []) as DailyReflection[];
    const hasMore = reflections.length === PAGE_SIZE;
    const nextCursor = hasMore && reflections.length > 0
      ? reflections[reflections.length - 1].reflection_date
      : null;

    return { data: reflections, nextCursor, hasMore };
  } catch (error) {
    console.error('[ReflectionHistory] Error:', error);
    return { data: [], nextCursor: null, hasMore: false };
  }
}

/**
 * Fetch reflections from local cache
 */
async function fetchLocalReflections(filter: HistoryFilter): Promise<PaginatedReflections> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const reflectionKeys = keys.filter(k => k.startsWith('daily_reflection:'));

    const now = new Date();
    let filterDate: Date | null = null;

    if (filter === 'week') {
      filterDate = getStartOfWeek(now);
    } else if (filter === 'month') {
      filterDate = getStartOfMonth(now);
    }

    const entries: DailyReflection[] = [];

    for (const key of reflectionKeys) {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        try {
          const reflection = JSON.parse(cached) as DailyReflection;

          // Apply filter
          if (filterDate) {
            const refDate = new Date(reflection.reflection_date + 'T12:00:00');
            if (refDate < filterDate) continue;
          }

          entries.push(reflection);
        } catch (e) {
          // Skip invalid entries
        }
      }
    }

    // Sort by date descending
    entries.sort((a, b) => b.reflection_date.localeCompare(a.reflection_date));

    return { data: entries, nextCursor: null, hasMore: false };
  } catch (error) {
    console.error('[ReflectionHistory] Error fetching local:', error);
    return { data: [], nextCursor: null, hasMore: false };
  }
}

/**
 * Fetch a single reflection by date
 */
export async function fetchReflectionByDate(
  userId: string,
  dateISO: string
): Promise<DailyReflection | null> {
  const cacheKey = getCacheKey(dateISO);

  // Try cache first
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const reflection = JSON.parse(cached) as DailyReflection;

      // For local users, return cached only
      if (userId === 'local') {
        return reflection;
      }

      // For authenticated users, fetch fresh in background
      fetchAndCacheReflection(userId, dateISO).catch(console.error);
      return reflection;
    }
  } catch (e) {
    // Cache read failed, continue to fetch
  }

  // For local users with no cache, return null
  if (userId === 'local') {
    return null;
  }

  // Fetch from Supabase
  return fetchAndCacheReflection(userId, dateISO);
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
    if (error.code === 'PGRST116') return null;
    console.error('[ReflectionHistory] Error fetching:', error);
    return null;
  }

  if (data) {
    const reflection = data as DailyReflection;
    await AsyncStorage.setItem(getCacheKey(dateISO), JSON.stringify(reflection));
    return reflection;
  }

  return null;
}

/**
 * Update a reflection
 */
export async function updateReflection(
  userId: string,
  dateISO: string,
  updates: { mood?: string | null; content?: string | null }
): Promise<DailyReflection | null> {
  const cacheKey = getCacheKey(dateISO);

  // For local users, update cache only
  if (userId === 'local') {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const reflection = JSON.parse(cached) as DailyReflection;
        const updated = {
          ...reflection,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(updated));
        return updated;
      }
    } catch (e) {
      console.error('[ReflectionHistory] Error updating local:', e);
    }
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('daily_reflections')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('reflection_date', dateISO)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      const reflection = data as DailyReflection;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(reflection));
      return reflection;
    }

    return null;
  } catch (error) {
    console.error('[ReflectionHistory] Error updating:', error);
    throw error;
  }
}

/**
 * Delete a reflection
 */
export async function deleteReflection(
  userId: string,
  dateISO: string
): Promise<boolean> {
  const cacheKey = getCacheKey(dateISO);

  // Remove from cache
  try {
    await AsyncStorage.removeItem(cacheKey);
  } catch (e) {
    // Continue even if cache removal fails
  }

  // For local users, cache removal is enough
  if (userId === 'local') {
    return true;
  }

  try {
    const { error } = await supabase
      .from('daily_reflections')
      .delete()
      .eq('user_id', userId)
      .eq('reflection_date', dateISO);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[ReflectionHistory] Error deleting:', error);
    throw error;
  }
}
