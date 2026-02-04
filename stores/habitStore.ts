import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Habit, HabitCompletion, HabitCategory, HabitFrequency, CompletionType } from '../types';
import { calculatePoints, formatDateForDB } from '../lib/utils';
import { POINTS } from '../lib/constants';

interface HabitState {
  habits: Habit[];
  todayCompletions: HabitCompletion[];
  isLoading: boolean;

  // Actions
  fetchHabits: (userId: string) => Promise<void>;
  fetchTodayCompletions: (userId: string) => Promise<void>;
  createHabit: (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  completeHabit: (habitId: string, userId: string, completionType: CompletionType) => Promise<number>;
  uncompleteHabit: (completionId: string) => Promise<void>;
  getTodayHabits: () => Habit[];
  isHabitCompletedToday: (habitId: string) => HabitCompletion | undefined;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayCompletions: [],
  isLoading: false,

  fetchHabits: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ habits: data as Habit[] });
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayCompletions: async (userId: string) => {
    try {
      const today = formatDateForDB(new Date());

      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed_at', today);

      if (error) throw error;

      set({ todayCompletions: data as HabitCompletion[] });
    } catch (error) {
      console.error('Error fetching today completions:', error);
    }
  },

  createHabit: async (habit) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        habits: [...state.habits, data as Habit],
      }));
    } catch (error) {
      console.error('Error creating habit:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateHabit: async (id: string, updates: Partial<Habit>) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        habits: state.habits.map(h =>
          h.id === id ? { ...h, ...updates } : h
        ),
      }));
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  },

  deleteHabit: async (id: string) => {
    try {
      // Soft delete - just mark as inactive
      const { error } = await supabase
        .from('habits')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        habits: state.habits.filter(h => h.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  },

  completeHabit: async (habitId: string, userId: string, completionType: CompletionType) => {
    try {
      const today = formatDateForDB(new Date());
      const points = calculatePoints(completionType);

      // Create completion record
      const { data: completion, error: completionError } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: userId,
          completed_at: today,
          completion_type: completionType,
          points_earned: points,
        })
        .select()
        .single();

      if (completionError) throw completionError;

      // Add to points ledger
      await supabase.from('points_ledger').insert({
        user_id: userId,
        points,
        source: completionType === 'fully' ? 'habit_fully' : 'habit_gently',
        reference_id: completion.id,
      });

      // Update user total points
      await supabase.rpc('increment_user_points', {
        user_id: userId,
        points_to_add: points,
      });

      // Update plant growth points
      await supabase.rpc('increment_plant_points', {
        user_id: userId,
        points_to_add: points,
      });

      set(state => ({
        todayCompletions: [...state.todayCompletions, completion as HabitCompletion],
      }));

      // Check if all habits are completed
      const { habits, todayCompletions } = get();
      const todayHabits = get().getTodayHabits();
      const completedCount = todayCompletions.length + 1;

      if (completedCount === todayHabits.length && todayHabits.length > 0) {
        // Award daily completion bonus
        await supabase.from('points_ledger').insert({
          user_id: userId,
          points: POINTS.DAILY_COMPLETE,
          source: 'daily_complete',
        });

        await supabase.rpc('increment_user_points', {
          user_id: userId,
          points_to_add: POINTS.DAILY_COMPLETE,
        });

        await supabase.rpc('increment_plant_points', {
          user_id: userId,
          points_to_add: POINTS.DAILY_COMPLETE,
        });

        return points + POINTS.DAILY_COMPLETE;
      }

      return points;
    } catch (error) {
      console.error('Error completing habit:', error);
      return 0;
    }
  },

  uncompleteHabit: async (completionId: string) => {
    try {
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', completionId);

      if (error) throw error;

      set(state => ({
        todayCompletions: state.todayCompletions.filter(c => c.id !== completionId),
      }));
    } catch (error) {
      console.error('Error uncompleting habit:', error);
    }
  },

  getTodayHabits: () => {
    const { habits } = get();
    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    return habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly') {
        // Show weekly habits on the first day they're set for, or Monday by default
        return habit.custom_days?.includes(dayOfWeek) || dayOfWeek === 'monday';
      }
      if (habit.frequency === 'custom' && habit.custom_days) {
        return habit.custom_days.includes(dayOfWeek);
      }
      return false;
    });
  },

  isHabitCompletedToday: (habitId: string) => {
    const { todayCompletions } = get();
    return todayCompletions.find(c => c.habit_id === habitId);
  },
}));
