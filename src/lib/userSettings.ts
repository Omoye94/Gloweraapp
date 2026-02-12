import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { User, FocusArea, ReminderPreference } from '../../types';

const CACHE_KEY = 'user_settings';

export interface UserSettings {
  id: string;
  onboarding_completed: boolean;
  focus_areas: FocusArea[];
  reminder_preference: ReminderPreference;
  total_points: number;
  reminders_enabled?: boolean;
  daily_reminder_time?: string | null;
}

export interface UserSettingsUpdate {
  onboarding_completed?: boolean;
  focus_areas?: FocusArea[];
  reminder_preference?: ReminderPreference;
}

/**
 * Get cached user settings from AsyncStorage
 */
export async function getCachedSettings(): Promise<UserSettings | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as UserSettings;
    }
    return null;
  } catch (error) {
    console.error('Error reading cached settings:', error);
    return null;
  }
}

/**
 * Cache user settings to AsyncStorage
 */
export async function cacheSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error caching settings:', error);
  }
}

/**
 * Clear cached user settings
 */
export async function clearCachedSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cached settings:', error);
  }
}

/**
 * Convert User to UserSettings
 */
function userToSettings(user: User): UserSettings {
  return {
    id: user.id,
    onboarding_completed: user.onboarding_completed,
    focus_areas: user.focus_areas,
    reminder_preference: user.reminder_preference,
    total_points: user.total_points,
  };
}

/**
 * Fetch user settings from Supabase users table by user_id
 */
export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, onboarding_completed, focus_areas, reminder_preference, total_points')
      .eq('id', userId)
      .single();

    if (error) {
      // If no row exists, return null (user needs to be created)
      if (error.code === 'PGRST116') {
        console.log('No user found in users table');
        return null;
      }
      throw error;
    }

    if (data) {
      const settings = userToSettings(data as User);
      await cacheSettings(settings);
      return settings;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}

/**
 * Update user settings in Supabase users table
 */
export async function updateUserSettings(
  userId: string,
  updates: UserSettingsUpdate
): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, onboarding_completed, focus_areas, reminder_preference, total_points')
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      const settings = userToSettings(data as User);
      await cacheSettings(settings);
      return settings;
    }

    return null;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return null;
  }
}

/**
 * Get user settings - tries cache first, then fetches from Supabase
 */
export async function getUserSettings(userId: string): Promise<{
  settings: UserSettings | null;
  fromCache: boolean;
  error: Error | null;
}> {
  // Try cache first for fast boot
  const cached = await getCachedSettings();

  if (cached && cached.id === userId) {
    // Return cached immediately, but also fetch fresh in background
    fetchUserSettings(userId).catch(console.error);
    return { settings: cached, fromCache: true, error: null };
  }

  // No cache or different user, fetch from Supabase
  try {
    const settings = await fetchUserSettings(userId);
    return { settings, fromCache: false, error: null };
  } catch (error) {
    return { settings: null, fromCache: false, error: error as Error };
  }
}

/**
 * Mark onboarding as complete and save preferences
 */
export async function completeOnboarding(
  userId: string,
  data: {
    focusAreas: FocusArea[];
    habitCount: number;
    reminderPreference: ReminderPreference;
  }
): Promise<UserSettings | null> {
  return updateUserSettings(userId, {
    onboarding_completed: true,
    focus_areas: data.focusAreas,
    reminder_preference: data.reminderPreference,
  });
}
