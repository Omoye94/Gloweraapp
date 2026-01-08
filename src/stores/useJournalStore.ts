import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { JournalEntry, Mood } from '../types/journal';
import { zustandStorage } from '../utils/storage';
import { formatDateKey, getISOTimestamp } from '../utils/dateUtils';

interface JournalState {
  entries: JournalEntry[];
  lastWeeklyPromptDate: string | null;

  // Actions
  addEntry: (content: string, mood?: Mood, promptUsed?: string) => JournalEntry;
  updateEntry: (id: string, updates: Partial<Pick<JournalEntry, 'content' | 'mood' | 'tags'>>) => void;
  deleteEntry: (id: string) => void;

  // Queries
  getEntryById: (id: string) => JournalEntry | undefined;
  getEntriesForDate: (date: string) => JournalEntry[];
  getRecentEntries: (limit?: number) => JournalEntry[];
  searchEntries: (query: string) => JournalEntry[];
  shouldShowWeeklyPrompt: () => boolean;
  markWeeklyPromptShown: () => void;

  // Reset
  resetJournal: () => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      lastWeeklyPromptDate: null,

      addEntry: (content, mood, promptUsed) => {
        const now = getISOTimestamp();
        const newEntry: JournalEntry = {
          id: uuidv4(),
          date: formatDateKey(),
          createdAt: now,
          updatedAt: now,
          content,
          mood,
          promptUsed,
          tags: [],
        };

        set(state => ({
          entries: [newEntry, ...state.entries],
        }));

        return newEntry;
      },

      updateEntry: (id, updates) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: getISOTimestamp() }
              : entry
          ),
        }));
      },

      deleteEntry: (id) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id),
        }));
      },

      getEntryById: (id) => {
        return get().entries.find(entry => entry.id === id);
      },

      getEntriesForDate: (date) => {
        return get().entries.filter(entry => entry.date === date);
      },

      getRecentEntries: (limit = 10) => {
        return get().entries.slice(0, limit);
      },

      searchEntries: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().entries.filter(entry =>
          entry.content.toLowerCase().includes(lowerQuery)
        );
      },

      shouldShowWeeklyPrompt: () => {
        const { lastWeeklyPromptDate } = get();
        if (!lastWeeklyPromptDate) return true;

        const lastDate = new Date(lastWeeklyPromptDate);
        const now = new Date();
        const daysSinceLastPrompt = Math.floor(
          (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        return daysSinceLastPrompt >= 7;
      },

      markWeeklyPromptShown: () => {
        set({ lastWeeklyPromptDate: getISOTimestamp() });
      },

      resetJournal: () => {
        set({ entries: [], lastWeeklyPromptDate: null });
      },
    }),
    {
      name: 'glowera-journal',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
