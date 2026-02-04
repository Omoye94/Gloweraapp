import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { CommunityPod, PodMembership, PodMessage } from '../types';

interface CommunityState {
  pods: CommunityPod[];
  userPods: PodMembership[];
  currentPodMessages: PodMessage[];
  isLoading: boolean;

  // Actions
  fetchAvailablePods: () => Promise<void>;
  fetchUserPods: (userId: string) => Promise<void>;
  fetchPodMessages: (podId: string) => Promise<void>;
  joinPod: (userId: string, podId: string, displayName?: string) => Promise<void>;
  leavePod: (membershipId: string) => Promise<void>;
  sendMessage: (podId: string, userId: string, content: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string, userId: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  pods: [],
  userPods: [],
  currentPodMessages: [],
  isLoading: false,

  fetchAvailablePods: async () => {
    set({ isLoading: true });
    try {
      // Get pods that aren't full
      const { data, error } = await supabase
        .from('community_pods')
        .select(`
          *,
          pod_memberships(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter to pods that have room
      const availablePods = (data || []).filter((pod: any) => {
        const memberCount = pod.pod_memberships?.[0]?.count || 0;
        return memberCount < pod.max_members;
      });

      set({ pods: availablePods as CommunityPod[] });
    } catch (error) {
      console.error('Error fetching pods:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserPods: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('pod_memberships')
        .select(`
          *,
          community_pods(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      set({ userPods: data as PodMembership[] });
    } catch (error) {
      console.error('Error fetching user pods:', error);
    }
  },

  fetchPodMessages: async (podId: string) => {
    try {
      const { data, error } = await supabase
        .from('pod_messages')
        .select('*')
        .eq('pod_id', podId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      set({ currentPodMessages: data as PodMessage[] });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  joinPod: async (userId: string, podId: string, displayName?: string) => {
    try {
      const { data, error } = await supabase
        .from('pod_memberships')
        .insert({
          user_id: userId,
          pod_id: podId,
          display_name: displayName || null,
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        userPods: [...state.userPods, data as PodMembership],
      }));
    } catch (error) {
      console.error('Error joining pod:', error);
    }
  },

  leavePod: async (membershipId: string) => {
    try {
      const { error } = await supabase
        .from('pod_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      set(state => ({
        userPods: state.userPods.filter(p => p.id !== membershipId),
      }));
    } catch (error) {
      console.error('Error leaving pod:', error);
    }
  },

  sendMessage: async (podId: string, userId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('pod_messages')
        .insert({
          pod_id: podId,
          user_id: userId,
          content,
          emoji_reactions: {},
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        currentPodMessages: [data as PodMessage, ...state.currentPodMessages],
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  addReaction: async (messageId: string, emoji: string, userId: string) => {
    try {
      const message = get().currentPodMessages.find(m => m.id === messageId);
      if (!message) return;

      const reactions = { ...message.emoji_reactions };
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }

      if (reactions[emoji].includes(userId)) {
        // Remove reaction
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      } else {
        // Add reaction
        reactions[emoji].push(userId);
      }

      const { error } = await supabase
        .from('pod_messages')
        .update({ emoji_reactions: reactions })
        .eq('id', messageId);

      if (error) throw error;

      set(state => ({
        currentPodMessages: state.currentPodMessages.map(m =>
          m.id === messageId ? { ...m, emoji_reactions: reactions } : m
        ),
      }));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  },
}));
