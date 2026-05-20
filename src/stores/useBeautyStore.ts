import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';
import { BeautyRitual, BeautyRitualCompletion, BeautyTimeOfDay } from '../types/beauty';

interface BeautyStoreState {
  rituals: BeautyRitual[];
  // keyed by YYYY-MM-DD
  completions: Record<string, BeautyRitualCompletion[]>;

  addRitual: (ritual: BeautyRitual) => void;
  updateRitual: (id: string, updates: Partial<BeautyRitual>) => void;
  removeRitual: (id: string) => void;
  setRituals: (rituals: BeautyRitual[]) => void;

  addCompletion: (completion: BeautyRitualCompletion) => void;
  removeCompletion: (ritualId: string, date: string) => void;
  setCompletionsForDate: (date: string, completions: BeautyRitualCompletion[]) => void;

  getActiveRituals: () => BeautyRitual[];
  getRitualsForTime: (timeOfDay: BeautyTimeOfDay) => BeautyRitual[];
  isCompletedOnDate: (ritualId: string, date: string) => boolean;
  getCompletionsForDate: (date: string) => BeautyRitualCompletion[];
}

export const useBeautyStore = create<BeautyStoreState>()(
  persist(
    (set, get) => ({
      rituals: [],
      completions: {},

      addRitual: (ritual) =>
        set({ rituals: [...get().rituals, ritual] }),

      updateRitual: (id, updates) =>
        set({
          rituals: get().rituals.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        }),

      removeRitual: (id) =>
        set({ rituals: get().rituals.filter((r) => r.id !== id) }),

      setRituals: (rituals) => set({ rituals }),

      addCompletion: (completion) => {
        const date = completion.completion_date;
        const existing = get().completions[date] ?? [];
        // Avoid duplicate completions for same ritual+date
        if (existing.some((c) => c.ritual_id === completion.ritual_id)) return;
        set({ completions: { ...get().completions, [date]: [...existing, completion] } });
      },

      removeCompletion: (ritualId, date) => {
        const existing = get().completions[date] ?? [];
        set({
          completions: {
            ...get().completions,
            [date]: existing.filter((c) => c.ritual_id !== ritualId),
          },
        });
      },

      setCompletionsForDate: (date, completions) =>
        set({ completions: { ...get().completions, [date]: completions } }),

      getActiveRituals: () => get().rituals.filter((r) => r.is_active),

      getRitualsForTime: (timeOfDay) =>
        get()
          .rituals.filter((r) => r.is_active && r.time_of_day === timeOfDay),

      isCompletedOnDate: (ritualId, date) =>
        (get().completions[date] ?? []).some((c) => c.ritual_id === ritualId),

      getCompletionsForDate: (date) => get().completions[date] ?? [],
    }),
    { name: 'glowera-beauty', storage: createJSONStorage(() => zustandStorage) },
  ),
);
