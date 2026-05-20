import { supabase } from '../../lib/supabase';

export interface GratitudeEntry {
  id: string;
  user_id: string;
  content: string;
  emoji: string;
  created_at: string;
}

export async function fetchEntries(userId: string): Promise<GratitudeEntry[]> {
  const { data, error } = await supabase
    .from('gratitude_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function insertEntry(
  userId: string,
  content: string,
  emoji: string,
): Promise<GratitudeEntry | null> {
  const { data, error } = await supabase
    .from('gratitude_entries')
    .insert({ user_id: userId, content, emoji })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('gratitude_entries')
    .delete()
    .eq('id', entryId);
  if (error) throw error;
}
