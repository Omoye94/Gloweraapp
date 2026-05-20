import { supabase } from '../../lib/supabase';
import { BeautyRitual, BeautyRitualCompletion, BeautyCategory, BeautyTimeOfDay, BeautyFrequency } from '../types/beauty';

export async function fetchRituals(userId: string): Promise<BeautyRitual[]> {
  const { data, error } = await supabase
    .from('beauty_rituals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createRitual(
  userId: string,
  payload: {
    title: string;
    category: BeautyCategory;
    time_of_day: BeautyTimeOfDay;
    frequency: BeautyFrequency;
    selected_days?: string[];
    notes?: string;
  },
): Promise<BeautyRitual> {
  const { data, error } = await supabase
    .from('beauty_rituals')
    .insert({ user_id: userId, ...payload, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRitual(
  ritualId: string,
  payload: Partial<Pick<BeautyRitual, 'title' | 'category' | 'time_of_day' | 'frequency' | 'selected_days' | 'notes'>>,
): Promise<BeautyRitual> {
  const { data, error } = await supabase
    .from('beauty_rituals')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', ritualId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function archiveRitual(ritualId: string): Promise<void> {
  const { error } = await supabase
    .from('beauty_rituals')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', ritualId);
  if (error) throw error;
}

export async function deleteRitual(ritualId: string): Promise<void> {
  const { error } = await supabase
    .from('beauty_rituals')
    .delete()
    .eq('id', ritualId);
  if (error) throw error;
}

export async function completeRitual(
  userId: string,
  ritualId: string,
  date: string, // YYYY-MM-DD
): Promise<BeautyRitualCompletion> {
  const { data, error } = await supabase
    .from('beauty_ritual_completions')
    .insert({ user_id: userId, ritual_id: ritualId, completion_date: date })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uncompleteRitual(
  userId: string,
  ritualId: string,
  date: string,
): Promise<void> {
  const { error } = await supabase
    .from('beauty_ritual_completions')
    .delete()
    .eq('user_id', userId)
    .eq('ritual_id', ritualId)
    .eq('completion_date', date);
  if (error) throw error;
}

export async function fetchCompletionsForDate(
  userId: string,
  date: string,
): Promise<BeautyRitualCompletion[]> {
  const { data, error } = await supabase
    .from('beauty_ritual_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('completion_date', date);
  if (error) throw error;
  return data ?? [];
}
