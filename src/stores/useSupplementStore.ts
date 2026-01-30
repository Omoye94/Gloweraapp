import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WellnessGoal, SupplementInfo } from '../types/supplement';
import { zustandStorage } from '../utils/storage';
import { SUPPLEMENT_CATALOG, getSupplementsByGoal } from '../constants/supplements';

interface DismissedSuggestion {
  supplementId: string;
  dismissedAt: string;
}

interface SupplementState {
  // User's selected wellness goals
  wellnessGoals: WellnessGoal[];

  // Supplements the user has dismissed from suggestions
  dismissedSuggestions: DismissedSuggestion[];

  // IDs of supplements already added as habits (to avoid re-suggesting)
  addedSupplementIds: string[];

  // Actions
  setWellnessGoals: (goals: WellnessGoal[]) => void;
  addWellnessGoal: (goal: WellnessGoal) => void;
  removeWellnessGoal: (goal: WellnessGoal) => void;

  dismissSuggestion: (supplementId: string) => void;
  undismissSuggestion: (supplementId: string) => void;
  clearDismissedSuggestions: () => void;

  markSupplementAdded: (supplementId: string) => void;
  markSupplementRemoved: (supplementId: string) => void;

  // Queries
  getSuggestions: (limit?: number) => SupplementInfo[];
  hasGoals: () => boolean;

  // Reset
  resetSupplementPreferences: () => void;
}

export const useSupplementStore = create<SupplementState>()(
  persist(
    (set, get) => ({
      wellnessGoals: [],
      dismissedSuggestions: [],
      addedSupplementIds: [],

      setWellnessGoals: (goals) => {
        set({ wellnessGoals: goals });
      },

      addWellnessGoal: (goal) => {
        const { wellnessGoals } = get();
        if (!wellnessGoals.includes(goal)) {
          set({ wellnessGoals: [...wellnessGoals, goal] });
        }
      },

      removeWellnessGoal: (goal) => {
        const { wellnessGoals } = get();
        set({ wellnessGoals: wellnessGoals.filter(g => g !== goal) });
      },

      dismissSuggestion: (supplementId) => {
        const { dismissedSuggestions } = get();
        if (!dismissedSuggestions.find(d => d.supplementId === supplementId)) {
          set({
            dismissedSuggestions: [
              ...dismissedSuggestions,
              { supplementId, dismissedAt: new Date().toISOString() },
            ],
          });
        }
      },

      undismissSuggestion: (supplementId) => {
        const { dismissedSuggestions } = get();
        set({
          dismissedSuggestions: dismissedSuggestions.filter(
            d => d.supplementId !== supplementId
          ),
        });
      },

      clearDismissedSuggestions: () => {
        set({ dismissedSuggestions: [] });
      },

      markSupplementAdded: (supplementId) => {
        const { addedSupplementIds } = get();
        if (!addedSupplementIds.includes(supplementId)) {
          set({ addedSupplementIds: [...addedSupplementIds, supplementId] });
        }
      },

      markSupplementRemoved: (supplementId) => {
        const { addedSupplementIds } = get();
        set({
          addedSupplementIds: addedSupplementIds.filter(id => id !== supplementId),
        });
      },

      getSuggestions: (limit = 3) => {
        const { wellnessGoals, dismissedSuggestions, addedSupplementIds } = get();

        // If no goals selected, return empty array
        if (wellnessGoals.length === 0) {
          return [];
        }

        // Get dismissed supplement IDs
        const dismissedIds = dismissedSuggestions.map(d => d.supplementId);

        // Collect all supplements matching user's goals
        const matchingSupplements = new Map<string, { supplement: SupplementInfo; score: number }>();

        wellnessGoals.forEach(goal => {
          const supplements = getSupplementsByGoal(goal);
          supplements.forEach(supplement => {
            // Skip if already dismissed or added
            if (dismissedIds.includes(supplement.id) || addedSupplementIds.includes(supplement.id)) {
              return;
            }

            const existing = matchingSupplements.get(supplement.id);
            if (existing) {
              // Increase score for supplements matching multiple goals
              existing.score += 1;
            } else {
              matchingSupplements.set(supplement.id, { supplement, score: 1 });
            }
          });
        });

        // Sort by score (higher = matches more goals) and return top results
        const sorted = Array.from(matchingSupplements.values())
          .sort((a, b) => b.score - a.score)
          .map(item => item.supplement);

        return sorted.slice(0, limit);
      },

      hasGoals: () => {
        const { wellnessGoals } = get();
        return wellnessGoals.length > 0;
      },

      resetSupplementPreferences: () => {
        set({
          wellnessGoals: [],
          dismissedSuggestions: [],
          addedSupplementIds: [],
        });
      },
    }),
    {
      name: 'glowera-supplements',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
