import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Reflection } from '../types';
import { POINTS, reflectionPrompts } from '../lib/constants';
import { getRandomItem } from '../lib/utils';

interface ReflectionState {
  reflections: Reflection[];
  isLoading: boolean;
  currentPrompt: string;

  // Actions
  fetchReflections: (userId: string) => Promise<void>;
  createReflection: (userId: string, content: string, mood?: string, prompt?: string) => Promise<void>;
  deleteReflection: (id: string) => Promise<void>;
  refreshPrompt: () => void;
}

export const useReflectionStore = create<ReflectionState>((set, get) => ({
  reflections: [],
  isLoading: false,
  currentPrompt: getRandomItem(reflectionPrompts),

  fetchReflections: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      set({ reflections: data as Reflection[] });
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  createReflection: async (userId: string, content: string, mood?: string, prompt?: string) => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .insert({
          user_id: userId,
          content,
          mood,
          prompt,
        })
        .select()
        .single();

      if (error) throw error;

      // Award points for reflection
      await supabase.from('points_ledger').insert({
        user_id: userId,
        points: POINTS.REFLECTION_COMPLETE,
        source: 'reflection',
        reference_id: data.id,
      });

      await supabase.rpc('increment_user_points', {
        user_id: userId,
        points_to_add: POINTS.REFLECTION_COMPLETE,
      });

      await supabase.rpc('increment_plant_points', {
        user_id: userId,
        points_to_add: POINTS.REFLECTION_COMPLETE,
      });

      set(state => ({
        reflections: [data as Reflection, ...state.reflections],
      }));

      // Get a new prompt
      get().refreshPrompt();
    } catch (error) {
      console.error('Error creating reflection:', error);
    }
  },

  deleteReflection: async (id: string) => {
    try {
      const { error } = await supabase
        .from('reflections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        reflections: state.reflections.filter(r => r.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting reflection:', error);
    }
  },

  refreshPrompt: () => {
    set({ currentPrompt: getRandomItem(reflectionPrompts) });
  },
}));
