import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, OnboardingData, FocusArea, ReminderPreference } from '../types';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({ session });
        await get().fetchUserProfile();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session });
      if (session?.user) {
        await get().fetchUserProfile();
      } else {
        set({ user: null });
      }
    });
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          display_name: null,
          avatar_url: null,
          focus_areas: [],
          reminder_preference: 'gentle',
          onboarding_completed: false,
          total_points: 0,
        });

        if (profileError) throw profileError;

        // Create initial plant
        await supabase.from('plants').insert({
          user_id: data.user.id,
          name: 'My Glow Plant',
          plant_type: 'default',
          growth_stage: 'seed',
          growth_points: 0,
        });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async (data: OnboardingData) => {
    const { session } = get();
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          focus_areas: data.focusAreas,
          reminder_preference: data.reminderPreference,
          onboarding_completed: true,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      await get().fetchUserProfile();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const { session } = get();
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', session.user.id);

      if (error) throw error;

      set(state => ({
        user: state.user ? { ...state.user, ...updates } : null,
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  },

  fetchUserProfile: async () => {
    const { session } = get();
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      set({ user: data as User });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  },
}));
