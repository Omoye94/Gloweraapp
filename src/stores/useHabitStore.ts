import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Habit, HabitCompletion, CompletionType, DailyHabitSummary } from '../types/habit';
import { SupplementInfo, SupplementMetadata } from '../types/supplement';
import { zustandStorage } from '../utils/storage';
import { formatDateKey, getISOTimestamp } from '../utils/dateUtils';
import { calculateHabitPoints } from '../utils/pointsCalculator';

interface HabitState {
  habits: Habit[];
  dailySummaries: Record<string, DailyHabitSummary>; // keyed by YYYY-MM-DD

  // Actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'order' | 'isActive'>) => void;
  addHabits: (habits: Omit<Habit, 'id' | 'createdAt' | 'order' | 'isActive'>[]) => void;
  addSupplementHabit: (supplementInfo: SupplementInfo, metadata: SupplementMetadata) => string;
  updateSupplementMeta: (habitId: string, meta: Partial<SupplementMetadata>) => void;
  removeHabit: (habitId: string) => void;
  toggleHabitActive: (habitId: string) => void;
  updateHabitOrder: (habitId: string, newOrder: number) => void;
  reorderHabits: (habitIdA: string, habitIdB: string) => void;

  // Completion actions
  completeHabit: (habitId: string, completionType: CompletionType) => number;
  uncompleteHabit: (habitId: string) => void;
  getCompletionForToday: (habitId: string) => HabitCompletion | undefined;

  // Queries
  getActiveHabits: () => Habit[];
  getTodaySummary: () => DailyHabitSummary | undefined;
  getTodayProgress: () => { completed: number; total: number; percentage: number };

  // Date-aware queries
  getProgressForDate: (date: string) => { completed: number; total: number; percentage: number };
  getCompletionForDate: (habitId: string, date: string) => HabitCompletion | undefined;

  // Progress habits
  incrementHabitProgress: (habitId: string, incrementBy?: number) => number;

  // Reset
  resetHabits: () => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      dailySummaries: {},

      addHabit: (habitData) => {
        const { habits } = get();
        const newHabit: Habit = {
          ...habitData,
          id: uuidv4(),
          createdAt: getISOTimestamp(),
          order: habits.length,
          isActive: true,
        };
        set({ habits: [...habits, newHabit] });
      },

      addHabits: (habitsData) => {
        const { habits } = get();
        const newHabits = habitsData.map((h, index) => ({
          ...h,
          id: uuidv4(),
          createdAt: getISOTimestamp(),
          order: habits.length + index,
          isActive: true,
        }));
        set({ habits: [...habits, ...newHabits] });
      },

      addSupplementHabit: (supplementInfo, metadata) => {
        const { habits } = get();
        const habitId = uuidv4();
        const newHabit: Habit = {
          id: habitId,
          name: `Take my ${supplementInfo.name} supplements ✨`,
          category: 'supplements',
          icon: supplementInfo.icon,
          isCustom: false,
          isActive: true,
          createdAt: getISOTimestamp(),
          order: habits.length,
          supplementMeta: {
            ...metadata,
            supplementInfoId: supplementInfo.id,
          },
        };
        set({ habits: [...habits, newHabit] });
        return habitId;
      },

      updateSupplementMeta: (habitId, meta) => {
        const { habits } = get();
        set({
          habits: habits.map(h =>
            h.id === habitId
              ? { ...h, supplementMeta: { ...h.supplementMeta, ...meta } }
              : h
          ),
        });
      },

      removeHabit: (habitId) => {
        const { habits } = get();
        set({ habits: habits.filter(h => h.id !== habitId) });
      },

      toggleHabitActive: (habitId) => {
        const { habits } = get();
        set({
          habits: habits.map(h =>
            h.id === habitId ? { ...h, isActive: !h.isActive } : h
          ),
        });
      },

      updateHabitOrder: (habitId, newOrder) => {
        const { habits } = get();
        set({
          habits: habits.map(h =>
            h.id === habitId ? { ...h, order: newOrder } : h
          ),
        });
      },

      reorderHabits: (habitIdA, habitIdB) => {
        const { habits } = get();
        const a = habits.find(h => h.id === habitIdA);
        const b = habits.find(h => h.id === habitIdB);
        if (!a || !b) return;
        const tempOrder = a.order;
        set({
          habits: habits.map(h => {
            if (h.id === habitIdA) return { ...h, order: b.order };
            if (h.id === habitIdB) return { ...h, order: tempOrder };
            return h;
          }),
        });
      },

      completeHabit: (habitId, completionType) => {
        const { dailySummaries, habits } = get();
        const today = formatDateKey();
        const currentSummary = dailySummaries[today] || {
          date: today,
          completions: {},
          totalPoints: 0,
          isFullDay: false,
        };

        const pointsEarned = calculateHabitPoints(completionType);

        const completion: HabitCompletion = {
          id: uuidv4(),
          habitId,
          date: today,
          completionType,
          completedAt: getISOTimestamp(),
          pointsEarned,
        };

        // If already completed, subtract old points first
        const existingCompletion = currentSummary.completions[habitId];
        const pointsDiff = existingCompletion
          ? pointsEarned - existingCompletion.pointsEarned
          : pointsEarned;

        const newCompletions = {
          ...currentSummary.completions,
          [habitId]: completion,
        };

        // Check if all active habits are fully completed
        const activeHabits = habits.filter(h => h.isActive);
        const isFullDay = activeHabits.every(h => {
          const comp = newCompletions[h.id];
          return comp && comp.completionType === 'full';
        });

        const newSummary: DailyHabitSummary = {
          ...currentSummary,
          completions: newCompletions,
          totalPoints: currentSummary.totalPoints + pointsDiff,
          isFullDay,
        };

        set({
          dailySummaries: { ...dailySummaries, [today]: newSummary },
        });

        return pointsEarned;
      },

      uncompleteHabit: (habitId) => {
        const { dailySummaries } = get();
        const today = formatDateKey();
        const currentSummary = dailySummaries[today];

        if (!currentSummary || !currentSummary.completions[habitId]) return;

        const existingCompletion = currentSummary.completions[habitId];
        const { [habitId]: _, ...remainingCompletions } = currentSummary.completions;

        const newSummary: DailyHabitSummary = {
          ...currentSummary,
          completions: remainingCompletions,
          totalPoints: currentSummary.totalPoints - existingCompletion.pointsEarned,
          isFullDay: false,
        };

        set({
          dailySummaries: { ...dailySummaries, [today]: newSummary },
        });
      },

      getCompletionForToday: (habitId) => {
        const { dailySummaries } = get();
        const today = formatDateKey();
        return dailySummaries[today]?.completions[habitId];
      },

      getActiveHabits: () => {
        const { habits } = get();
        return habits.filter(h => h.isActive).sort((a, b) => a.order - b.order);
      },

      getTodaySummary: () => {
        const { dailySummaries } = get();
        const today = formatDateKey();
        return dailySummaries[today];
      },

      getTodayProgress: () => {
        const { habits, dailySummaries } = get();
        const today = formatDateKey();
        const activeHabits = habits.filter(h => h.isActive);
        const summary = dailySummaries[today];

        const total = activeHabits.length;
        const completed = summary ? Object.keys(summary.completions).length : 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { completed, total, percentage };
      },

      getProgressForDate: (date: string) => {
        const { habits, dailySummaries } = get();
        const activeHabits = habits.filter(h => h.isActive);
        const summary = dailySummaries[date];
        const total = activeHabits.length;
        const completed = summary ? Object.keys(summary.completions).length : 0;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
      },

      getCompletionForDate: (habitId: string, date: string) => {
        const { dailySummaries } = get();
        return dailySummaries[date]?.completions[habitId];
      },

      incrementHabitProgress: (habitId: string, incrementBy: number = 1) => {
        const { dailySummaries, habits } = get();
        const today = formatDateKey();
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return 0;

        const currentSummary = dailySummaries[today] || {
          date: today,
          completions: {},
          totalPoints: 0,
          isFullDay: false,
        };

        const existingCompletion = currentSummary.completions[habitId];
        const currentProgress = existingCompletion?.progressValue ?? 0;
        const newProgress = currentProgress + incrementBy;
        const target = habit.targetValue ?? 1;
        const isNowComplete = newProgress >= target;

        const completionType: CompletionType = isNowComplete ? 'full' : 'gentle';
        const pointsEarned = calculateHabitPoints(completionType);

        const completion: HabitCompletion = {
          id: existingCompletion?.id || uuidv4(),
          habitId,
          date: today,
          completionType,
          completedAt: getISOTimestamp(),
          pointsEarned,
          progressValue: newProgress,
        };

        const pointsDiff = existingCompletion
          ? pointsEarned - existingCompletion.pointsEarned
          : pointsEarned;

        const newCompletions = {
          ...currentSummary.completions,
          [habitId]: completion,
        };

        const activeHabits = habits.filter(h => h.isActive);
        const isFullDay = activeHabits.every(h => {
          const comp = newCompletions[h.id];
          return comp && comp.completionType === 'full';
        });

        const newSummary: DailyHabitSummary = {
          ...currentSummary,
          completions: newCompletions,
          totalPoints: currentSummary.totalPoints + pointsDiff,
          isFullDay,
        };

        set({
          dailySummaries: { ...dailySummaries, [today]: newSummary },
        });

        return pointsEarned;
      },

      resetHabits: () => {
        set({ habits: [], dailySummaries: {} });
      },
    }),
    {
      name: 'glowera-habits',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
