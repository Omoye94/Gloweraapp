import { useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { GratitudeEntry, fetchEntries, insertEntry, deleteEntry } from '../lib/gratitude';
import { useGratitudeStore } from '../stores/useGratitudeStore';

export function useGratitude() {
  const { entries, addEntry, removeEntry, setEntries } = useGratitudeStore();

  // Background Supabase sync on mount — failures don't affect local state
  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const remote = await fetchEntries(user.id);
        if (remote.length > 0) setEntries(remote);
      } catch {
        // Supabase unavailable — local entries from AsyncStorage store are used
      }
    })();
  }, []);

  const handleAdd = useCallback(async (content: string, emoji: string) => {
    const localEntry: GratitudeEntry = {
      id: `local-${Date.now()}`,
      user_id: '',
      content,
      emoji,
      created_at: new Date().toISOString(),
    };
    // Add to local store immediately — persists across restarts regardless of Supabase
    addEntry(localEntry);

    // Best-effort Supabase insert — swap local id with real id if successful
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const saved = await insertEntry(user.id, content, emoji);
      if (saved) {
        const store = useGratitudeStore.getState();
        store.removeEntry(localEntry.id);
        store.addEntry(saved);
      }
    } catch {
      // Keep local entry — Supabase is optional
    }
  }, [addEntry]);

  const handleRemove = useCallback(async (id: string) => {
    removeEntry(id); // Remove locally immediately
    try {
      if (!id.startsWith('local-')) await deleteEntry(id);
    } catch {
      // Best-effort
    }
  }, [removeEntry]);

  return { entries, addEntry: handleAdd, removeEntry: handleRemove };
}
