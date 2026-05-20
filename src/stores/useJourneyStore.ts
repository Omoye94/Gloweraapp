import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { JourneyEvent, JourneyEventType, FutureMessage } from '../types/journey';
import { zustandStorage } from '../utils/storage';
import { getISOTimestamp } from '../utils/dateUtils';
import { supabase } from '../../lib/supabase';

interface JourneyStoreState {
  events: JourneyEvent[];
  futureMessages: FutureMessage[];

  addEvent: (event: Omit<JourneyEvent, 'id' | 'created_at'>) => void;
  fetchEvents: () => Promise<void>;
  addFutureMessage: (message: string, deliverAfterDays: number) => void;
  checkFutureMessages: () => void;
  getLatestEvent: () => JourneyEvent | null;
  resetJourney: () => void;
}

export const useJourneyStore = create<JourneyStoreState>()(
  persist(
    (set, get) => ({
      events: [],
      futureMessages: [],

      addEvent: (eventData) => {
        const { events } = get();
        const newEvent: JourneyEvent = {
          ...eventData,
          id: uuidv4(),
          created_at: getISOTimestamp(),
        };

        set({ events: [newEvent, ...events] });

        // Async insert to Supabase (fire-and-forget)
        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.from('journey_events').insert({
              id: newEvent.id,
              user_id: user.id,
              event_type: newEvent.event_type,
              title: newEvent.title,
              description: newEvent.description,
              icon: newEvent.icon,
              created_at: newEvent.created_at,
            });
          } catch (err) {
            console.error('[Journey] Supabase insert error:', err);
          }
        })();
      },

      fetchEvents: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('journey_events')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(100);

          if (error) throw error;
          if (!data || data.length === 0) return;

          const { events: localEvents } = get();
          const localIds = new Set(localEvents.map(e => e.id));
          const remoteEvents = (data as JourneyEvent[]).filter(e => !localIds.has(e.id));

          if (remoteEvents.length > 0) {
            const merged = [...localEvents, ...remoteEvents]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            set({ events: merged });
          }
        } catch (err) {
          console.error('[Journey] fetchEvents error:', err);
        }
      },

      addFutureMessage: (message, deliverAfterDays) => {
        const { futureMessages } = get();
        const deliverAt = new Date();
        deliverAt.setDate(deliverAt.getDate() + deliverAfterDays);

        const newMsg: FutureMessage = {
          id: uuidv4(),
          user_id: '',
          message,
          deliver_at: deliverAt.toISOString(),
          delivered: false,
          created_at: getISOTimestamp(),
        };

        set({ futureMessages: [...futureMessages, newMsg] });

        // Async insert to Supabase
        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.from('future_messages').insert({
              id: newMsg.id,
              user_id: user.id,
              message: newMsg.message,
              deliver_at: newMsg.deliver_at,
            });
          } catch (err) {
            console.error('[Journey] Supabase future_messages insert error:', err);
          }
        })();
      },

      checkFutureMessages: () => {
        const { futureMessages, events } = get();
        const now = new Date();
        const toDeliver = futureMessages.filter(
          m => !m.delivered && new Date(m.deliver_at) <= now
        );

        if (toDeliver.length === 0) return;

        const newEvents: JourneyEvent[] = toDeliver.map(m => ({
          id: uuidv4(),
          user_id: m.user_id,
          event_type: 'future_message' as JourneyEventType,
          title: 'A message from your past self',
          description: m.message,
          icon: '💌',
          created_at: getISOTimestamp(),
        }));

        const updatedMessages = futureMessages.map(m =>
          toDeliver.find(d => d.id === m.id)
            ? { ...m, delivered: true }
            : m
        );

        set({
          futureMessages: updatedMessages,
          events: [...newEvents, ...events],
        });

        // Mark as delivered in Supabase
        (async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const ids = toDeliver.map(m => m.id);
            await supabase
              .from('future_messages')
              .update({ delivered: true })
              .in('id', ids);
            // Also insert the journey events
            for (const evt of newEvents) {
              await supabase.from('journey_events').insert({
                ...evt,
                user_id: user.id,
              });
            }
          } catch (err) {
            console.error('[Journey] checkFutureMessages sync error:', err);
          }
        })();
      },

      getLatestEvent: () => {
        const { events } = get();
        return events.length > 0 ? events[0] : null;
      },

      resetJourney: () => {
        set({ events: [], futureMessages: [] });
      },
    }),
    {
      name: 'glowera-journey',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
