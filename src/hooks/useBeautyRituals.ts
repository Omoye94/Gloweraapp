import { useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { BeautyRitual, BeautyCategory, BeautyTimeOfDay, BeautyFrequency } from '../types/beauty';
import {
  fetchRituals,
  createRitual,
  updateRitual,
  archiveRitual,
  deleteRitual,
  completeRitual,
  uncompleteRitual,
  fetchCompletionsForDate,
} from '../lib/beautyRituals';
import { useBeautyStore } from '../stores/useBeautyStore';
import { formatDateKey } from '../utils/dateUtils';

type CreatePayload = {
  title: string;
  category: BeautyCategory;
  time_of_day: BeautyTimeOfDay;
  frequency: BeautyFrequency;
  selected_days?: string[];
  notes?: string;
};

export function useBeautyRituals() {
  const store = useBeautyStore();

  // Background Supabase sync on mount — failures don't affect local state
  useEffect(() => {
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const remote = await fetchRituals(user.id);
        if (remote.length > 0) store.setRituals(remote);

        const today = formatDateKey(new Date());
        const completions = await fetchCompletionsForDate(user.id, today);
        store.setCompletionsForDate(today, completions);
      } catch {
        // Supabase unavailable — local data from AsyncStorage store is used
      }
    })();
  }, []);

  const handleCreate = useCallback(
    async (payload: CreatePayload) => {
      const localRitual: BeautyRitual = {
        id: `local-${Date.now()}`,
        user_id: '',
        ...payload,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.addRitual(localRitual);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const saved = await createRitual(user.id, payload);
        if (saved) {
          store.removeRitual(localRitual.id);
          store.addRitual(saved);
        }
      } catch {
        // Keep local — Supabase is optional
      }
    },
    [store],
  );

  const handleUpdate = useCallback(
    async (id: string, payload: Partial<CreatePayload>) => {
      store.updateRitual(id, { ...payload, updated_at: new Date().toISOString() });
      try {
        if (!id.startsWith('local-')) await updateRitual(id, payload);
      } catch {
        // Best-effort
      }
    },
    [store],
  );

  const handleArchive = useCallback(
    async (id: string) => {
      store.updateRitual(id, { is_active: false });
      try {
        if (!id.startsWith('local-')) await archiveRitual(id);
      } catch {
        // Best-effort
      }
    },
    [store],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      store.removeRitual(id);
      try {
        if (!id.startsWith('local-')) await deleteRitual(id);
      } catch {
        // Best-effort
      }
    },
    [store],
  );

  const handleComplete = useCallback(
    async (ritualId: string) => {
      const today = formatDateKey(new Date());
      const localCompletion = {
        id: `local-${Date.now()}`,
        ritual_id: ritualId,
        user_id: '',
        completion_date: today,
        completed_at: new Date().toISOString(),
      };
      store.addCompletion(localCompletion);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const saved = await completeRitual(user.id, ritualId, today);
        if (saved) {
          store.removeCompletion(ritualId, today);
          store.addCompletion(saved);
        }
      } catch {
        // Best-effort
      }
    },
    [store],
  );

  const handleUncomplete = useCallback(
    async (ritualId: string) => {
      const today = formatDateKey(new Date());
      store.removeCompletion(ritualId, today);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await uncompleteRitual(user.id, ritualId, today);
      } catch {
        // Best-effort
      }
    },
    [store],
  );

  return {
    rituals: store.getActiveRituals(),
    getRitualsForTime: store.getRitualsForTime,
    isCompletedToday: (ritualId: string) =>
      store.isCompletedOnDate(ritualId, formatDateKey(new Date())),
    handleCreate,
    handleUpdate,
    handleArchive,
    handleDelete,
    handleComplete,
    handleUncomplete,
  };
}
