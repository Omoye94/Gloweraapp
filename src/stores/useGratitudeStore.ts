import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../utils/storage';
import { GratitudeEntry } from '../lib/gratitude';

interface GratitudeStoreState {
  entries: GratitudeEntry[];
  addEntry: (entry: GratitudeEntry) => void;
  removeEntry: (id: string) => void;
  setEntries: (entries: GratitudeEntry[]) => void;
}

export const useGratitudeStore = create<GratitudeStoreState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set({ entries: [entry, ...get().entries] }),
      removeEntry: (id) => set({ entries: get().entries.filter((e) => e.id !== id) }),
      setEntries: (entries) => set({ entries }),
    }),
    { name: 'glowera-gratitude', storage: createJSONStorage(() => zustandStorage) },
  ),
);
