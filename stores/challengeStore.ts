import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Challenge, ChallengeParticipation } from '../types';
import { POINTS } from '../lib/constants';

interface ChallengeState {
  challenges: Challenge[];
  activeParticipations: ChallengeParticipation[];
  isLoading: boolean;

  // Actions
  fetchChallenges: () => Promise<void>;
  fetchUserParticipations: (userId: string) => Promise<void>;
  joinChallenge: (userId: string, challengeId: string) => Promise<void>;
  leaveChallenge: (participationId: string) => Promise<void>;
  completeDay: (participationId: string, userId: string) => Promise<void>;
  completeChallenge: (participationId: string, userId: string) => Promise<void>;
  getActiveChallenge: (challengeId: string) => ChallengeParticipation | undefined;
  getChallengeProgress: (participation: ChallengeParticipation, challenge: Challenge) => number;
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  activeParticipations: [],
  isLoading: false,

  fetchChallenges: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ challenges: data as Challenge[] });
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserParticipations: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', userId)
        .is('completed_at', null);

      if (error) throw error;

      set({ activeParticipations: data as ChallengeParticipation[] });
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
  },

  joinChallenge: async (userId: string, challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          started_at: new Date().toISOString(),
          days_completed: 0,
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        activeParticipations: [...state.activeParticipations, data as ChallengeParticipation],
      }));
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  },

  leaveChallenge: async (participationId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participations')
        .delete()
        .eq('id', participationId);

      if (error) throw error;

      set(state => ({
        activeParticipations: state.activeParticipations.filter(p => p.id !== participationId),
      }));
    } catch (error) {
      console.error('Error leaving challenge:', error);
    }
  },

  completeDay: async (participationId: string, userId: string) => {
    try {
      const participation = get().activeParticipations.find(p => p.id === participationId);
      if (!participation) return;

      const newDaysCompleted = participation.days_completed + 1;

      const { error } = await supabase
        .from('challenge_participations')
        .update({ days_completed: newDaysCompleted })
        .eq('id', participationId);

      if (error) throw error;

      set(state => ({
        activeParticipations: state.activeParticipations.map(p =>
          p.id === participationId ? { ...p, days_completed: newDaysCompleted } : p
        ),
      }));

      // Check if challenge is complete
      const challenge = get().challenges.find(c => c.id === participation.challenge_id);
      if (challenge && newDaysCompleted >= challenge.duration_days) {
        await get().completeChallenge(participationId, userId);
      }
    } catch (error) {
      console.error('Error completing day:', error);
    }
  },

  completeChallenge: async (participationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participations')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', participationId);

      if (error) throw error;

      // Award points
      await supabase.from('points_ledger').insert({
        user_id: userId,
        points: POINTS.CHALLENGE_COMPLETE,
        source: 'challenge',
        reference_id: participationId,
      });

      await supabase.rpc('increment_user_points', {
        user_id: userId,
        points_to_add: POINTS.CHALLENGE_COMPLETE,
      });

      await supabase.rpc('increment_plant_points', {
        user_id: userId,
        points_to_add: POINTS.CHALLENGE_COMPLETE,
      });

      set(state => ({
        activeParticipations: state.activeParticipations.filter(p => p.id !== participationId),
      }));
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  },

  getActiveChallenge: (challengeId: string) => {
    return get().activeParticipations.find(p => p.challenge_id === challengeId);
  },

  getChallengeProgress: (participation: ChallengeParticipation, challenge: Challenge) => {
    return Math.round((participation.days_completed / challenge.duration_days) * 100);
  },
}));
