import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Supplement, SupplementLog, SupplementTimeOfDay } from '../types';
import { formatDateForDB, getCurrentWeekDays, getRandomItem } from '../lib/utils';
import { POINTS, SUPPLEMENT_MESSAGES } from '../lib/constants';

interface SupplementState {
  supplements: Supplement[];
  todayLogs: SupplementLog[];
  weekLogs: SupplementLog[];
  isLoading: boolean;

  // Actions
  fetchSupplements: (userId: string) => Promise<void>;
  fetchTodayLogs: (userId: string) => Promise<void>;
  fetchWeekLogs: (userId: string) => Promise<void>;
  createSupplement: (supplement: Omit<Supplement, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSupplement: (id: string, updates: Partial<Supplement>) => Promise<void>;
  deleteSupplement: (id: string) => Promise<void>;
  takeSupplement: (supplementId: string, userId: string) => Promise<{ points: number; message: string }>;
  untakeSupplement: (logId: string) => Promise<void>;

  // Derived
  isSupplementTakenToday: (supplementId: string) => SupplementLog | undefined;
  getTodayProgress: () => { taken: number; total: number };
  getWeekConsistency: () => { date: Date; taken: number; total: number }[];
}

export const useSupplementStore = create<SupplementState>((set, get) => ({
  supplements: [],
  todayLogs: [],
  weekLogs: [],
  isLoading: false,

  fetchSupplements: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ supplements: data as Supplement[] });
    } catch (error) {
      console.error('Error fetching supplements:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTodayLogs: async (userId: string) => {
    try {
      const today = formatDateForDB(new Date());

      const { data, error } = await supabase
        .from('supplement_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('taken_at', today);

      if (error) throw error;

      set({ todayLogs: data as SupplementLog[] });
    } catch (error) {
      console.error('Error fetching today supplement logs:', error);
    }
  },

  fetchWeekLogs: async (userId: string) => {
    try {
      const weekDays = getCurrentWeekDays();
      const startDate = formatDateForDB(weekDays[0]);
      const endDate = formatDateForDB(weekDays[weekDays.length - 1]);

      const { data, error } = await supabase
        .from('supplement_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('taken_at', startDate)
        .lte('taken_at', endDate);

      if (error) throw error;

      set({ weekLogs: data as SupplementLog[] });
    } catch (error) {
      console.error('Error fetching week supplement logs:', error);
    }
  },

  createSupplement: async (supplement) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('supplements')
        .insert(supplement)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        supplements: [...state.supplements, data as Supplement],
      }));
    } catch (error) {
      console.error('Error creating supplement:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateSupplement: async (id: string, updates: Partial<Supplement>) => {
    try {
      const { error } = await supabase
        .from('supplements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        supplements: state.supplements.map(s =>
          s.id === id ? { ...s, ...updates } : s
        ),
      }));
    } catch (error) {
      console.error('Error updating supplement:', error);
    }
  },

  deleteSupplement: async (id: string) => {
    try {
      // Soft delete
      const { error } = await supabase
        .from('supplements')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        supplements: state.supplements.filter(s => s.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting supplement:', error);
    }
  },

  takeSupplement: async (supplementId: string, userId: string) => {
    try {
      const today = formatDateForDB(new Date());
      const points = POINTS.SUPPLEMENT_TAKEN;

      // Create log record
      const { data: log, error: logError } = await supabase
        .from('supplement_logs')
        .insert({
          supplement_id: supplementId,
          user_id: userId,
          taken_at: today,
          points_earned: points,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Add to points ledger
      await supabase.from('points_ledger').insert({
        user_id: userId,
        points,
        source: 'supplement',
        reference_id: log.id,
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
        todayLogs: [...state.todayLogs, log as SupplementLog],
      }));

      // Check if all supplements are now taken
      const { supplements, todayLogs } = get();
      const takenCount = todayLogs.length + 1;
      let totalPoints = points;
      let message = getRandomItem(SUPPLEMENT_MESSAGES.taken);

      if (takenCount === supplements.length && supplements.length > 1) {
        // Award all-supplements bonus
        const bonusPoints = POINTS.ALL_SUPPLEMENTS_TAKEN;

        await supabase.from('points_ledger').insert({
          user_id: userId,
          points: bonusPoints,
          source: 'supplement_all',
        });

        await supabase.rpc('increment_user_points', {
          user_id: userId,
          points_to_add: bonusPoints,
        });

        await supabase.rpc('increment_plant_points', {
          user_id: userId,
          points_to_add: bonusPoints,
        });

        totalPoints += bonusPoints;
        message = getRandomItem(SUPPLEMENT_MESSAGES.allTaken);
      }

      return { points: totalPoints, message };
    } catch (error) {
      console.error('Error taking supplement:', error);
      return { points: 0, message: '' };
    }
  },

  untakeSupplement: async (logId: string) => {
    try {
      const { error } = await supabase
        .from('supplement_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      set(state => ({
        todayLogs: state.todayLogs.filter(l => l.id !== logId),
      }));
    } catch (error) {
      console.error('Error undoing supplement:', error);
    }
  },

  isSupplementTakenToday: (supplementId: string) => {
    const { todayLogs } = get();
    return todayLogs.find(l => l.supplement_id === supplementId);
  },

  getTodayProgress: () => {
    const { supplements, todayLogs } = get();
    return { taken: todayLogs.length, total: supplements.length };
  },

  getWeekConsistency: () => {
    const { supplements, weekLogs } = get();
    const weekDays = getCurrentWeekDays();
    const total = supplements.length;

    return weekDays.map(date => {
      const dateStr = formatDateForDB(date);
      const taken = weekLogs.filter(l => l.taken_at === dateStr).length;
      return { date, taken, total };
    });
  },
}));
