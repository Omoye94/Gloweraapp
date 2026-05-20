import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  ActiveChallengeInfo,
  UserChallengeDay,
  getActiveChallenge,
  getChallengeDays,
  getTodayChallengeDay,
  getCompletedChallengeIds,
} from '../lib/challenges';

export interface UseChallengesReturn {
  activeChallenge: ActiveChallengeInfo | null;
  todayDay: UserChallengeDay | null;
  days: UserChallengeDay[];
  completedIds: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  userId: string;
  refresh: () => Promise<void>;
}

export function useChallenges(): UseChallengesReturn {
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallengeInfo | null>(null);
  const [days, setDays] = useState<UserChallengeDay[]>([]);
  const [todayDay, setTodayDay] = useState<UserChallengeDay | null>(null);
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
      const [active, completed] = await Promise.all([
        getActiveChallenge(uid),
        getCompletedChallengeIds(uid),
      ]);

      setActiveChallenge(active);
      setCompletedIds(completed);

      if (active) {
        const dayRows = await getChallengeDays(uid, active.userChallenge.id);
        setDays(dayRows);
        setTodayDay(getTodayChallengeDay(active.userChallenge, dayRows));
      } else {
        setDays([]);
        setTodayDay(null);
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

  return {
    activeChallenge,
    todayDay,
    days,
    completedIds,
    isLoading,
    isRefreshing,
    userId,
    refresh,
  };
}
