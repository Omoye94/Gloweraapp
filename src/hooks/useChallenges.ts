import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ActiveChallengeInfo,
  UserChallengeDay,
  MAX_ACTIVE_CHALLENGES,
  getActiveChallenges,
  getChallengeDays,
  getTodayChallengeDay,
  getCompletedChallengeIds,
} from '../lib/challenges';

export interface UseChallengesReturn {
  /** All currently active challenges (up to MAX_ACTIVE_CHALLENGES). */
  activeChallenges: ActiveChallengeInfo[];
  /** The first active challenge, or null. Kept for backward compat. */
  activeChallenge: ActiveChallengeInfo | null;
  /** Whether the user is at the active-challenge cap. */
  isAtCap: boolean;
  /** Today's day row for the FIRST active challenge (backward compat). */
  todayDay: UserChallengeDay | null;
  /** Day rows for the FIRST active challenge (backward compat). */
  days: UserChallengeDay[];
  /** Day rows keyed by user_challenge_id, for all actives. */
  daysByChallenge: Record<string, UserChallengeDay[]>;
  /** Get day rows for a specific user_challenge. */
  getDaysFor: (userChallengeId: string) => UserChallengeDay[];
  /** Get today's day row for a specific user_challenge. */
  getTodayDayFor: (userChallengeId: string) => UserChallengeDay | null;
  completedIds: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  userId: string;
  refresh: () => Promise<void>;
}

export function useChallenges(): UseChallengesReturn {
  const [activeChallenges, setActiveChallenges] = useState<ActiveChallengeInfo[]>([]);
  const [daysByChallenge, setDaysByChallenge] = useState<Record<string, UserChallengeDay[]>>({});
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState<string>('local');

  const load = useCallback(async (uid: string, refreshing = false) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [actives, completed] = await Promise.all([
        getActiveChallenges(uid),
        getCompletedChallengeIds(uid),
      ]);

      setActiveChallenges(actives);
      setCompletedIds(completed);

      // Load day rows for every active challenge in parallel.
      if (actives.length > 0) {
        const dayResults = await Promise.all(
          actives.map((a) => getChallengeDays(uid, a.userChallenge.id))
        );
        const map: Record<string, UserChallengeDay[]> = {};
        actives.forEach((a, i) => {
          map[a.userChallenge.id] = dayResults[i];
        });
        setDaysByChallenge(map);
      } else {
        setDaysByChallenge({});
      }
    } catch (err) {
      console.error('[useChallenges] load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id || 'local';
      setUserId(uid);
      await load(uid);
    })();
  }, [load]);

  const refresh = useCallback(async () => {
    await load(userId, true);
  }, [load, userId]);

  const getDaysFor = useCallback(
    (userChallengeId: string) => daysByChallenge[userChallengeId] ?? [],
    [daysByChallenge]
  );

  const getTodayDayFor = useCallback(
    (userChallengeId: string) => {
      const active = activeChallenges.find((a) => a.userChallenge.id === userChallengeId);
      if (!active) return null;
      const rows = daysByChallenge[userChallengeId] ?? [];
      return getTodayChallengeDay(active.userChallenge, rows);
    },
    [activeChallenges, daysByChallenge]
  );

  // Backward-compat derived values.
  const activeChallenge = activeChallenges[0] ?? null;
  const days = activeChallenge ? daysByChallenge[activeChallenge.userChallenge.id] ?? [] : [];
  const todayDay = activeChallenge
    ? getTodayChallengeDay(activeChallenge.userChallenge, days)
    : null;
  const isAtCap = activeChallenges.length >= MAX_ACTIVE_CHALLENGES;

  return {
    activeChallenges,
    activeChallenge,
    isAtCap,
    todayDay,
    days,
    daysByChallenge,
    getDaysFor,
    getTodayDayFor,
    completedIds,
    isLoading,
    isRefreshing,
    userId,
    refresh,
  };
}
