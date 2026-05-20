import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';
import { formatDateKey } from '../utils/dateUtils';

const DAILY_GOAL = 8;

interface HydrationStoreState {
  daily: Record<string, number>;
  dailyGoal: number;
  addGlass: () => void;
  removeGlass: () => void;
  resetToday: () => void;
  getTodayGlasses: () => number;
  getGlassesForDate: (date: string) => number;
}

export const useHydrationStore = create<HydrationStoreState>()(
  persist(
    (set, get) => ({
      daily: {},
      dailyGoal: DAILY_GOAL,

      addGlass: () => {
        const key = formatDateKey();
        const current = get().daily[key] ?? 0;
        if (current >= get().dailyGoal) return;
        set({ daily: { ...get().daily, [key]: current + 1 } });
      },

      removeGlass: () => {
        const key = formatDateKey();
        const current = get().daily[key] ?? 0;
        if (current <= 0) return;
        set({ daily: { ...get().daily, [key]: current - 1 } });
      },

      resetToday: () => {
        const key = formatDateKey();
        set({ daily: { ...get().daily, [key]: 0 } });
      },

      getTodayGlasses: () => get().daily[formatDateKey()] ?? 0,
      getGlassesForDate: (date) => get().daily[date] ?? 0,
    }),
    { name: 'glowera-hydration', storage: createJSONStorage(() => zustandStorage) },
  ),
);
