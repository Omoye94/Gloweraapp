import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { UserChallenge, ChallengeStatus } from '../types/challenge';
import { zustandStorage } from '../utils/storage';
import { formatDateKey, getISOTimestamp, getDaysSince } from '../utils/dateUtils';
import { DEFAULT_CHALLENGES, getChallengeById } from '../constants/challenges';
import { POINT_VALUES } from '../utils/pointsCalculator';

interface ChallengeState {
  userChallenges: UserChallenge[];

  // Actions
  startChallenge: (challengeId: string) => UserChallenge | null;
  completeDay: (userChallengeId: string, day: number) => number; // Returns points earned
  abandonChallenge: (userChallengeId: string) => void;

  // Queries
  getActiveChallenge: () => UserChallenge | undefined;
  getCompletedChallenges: () => UserChallenge[];
  getChallengeProgress: (userChallengeId: string) => { current: number; total: number; percentage: number };
  getCurrentDay: (userChallengeId: string) => number;
  isDayCompleted: (userChallengeId: string, day: number) => boolean;
  getAvailableChallenges: () => typeof DEFAULT_CHALLENGES;

  // Reset
  resetChallenges: () => void;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      userChallenges: [],

      startChallenge: (challengeId) => {
        const { userChallenges } = get();

        // Check if there's already an active challenge
        const hasActive = userChallenges.some(c => c.status === 'active');
        if (hasActive) return null;

        // Check if challenge exists
        const challenge = getChallengeById(challengeId);
        if (!challenge) return null;

        const newChallenge: UserChallenge = {
          id: uuidv4(),
          challengeId,
          startDate: formatDateKey(),
          status: 'active',
          completedDays: [],
          pointsEarned: 0,
        };

        set({ userChallenges: [...userChallenges, newChallenge] });
        return newChallenge;
      },

      completeDay: (userChallengeId, day) => {
        const { userChallenges } = get();
        const challenge = userChallenges.find(c => c.id === userChallengeId);

        if (!challenge || challenge.status !== 'active') return 0;
        if (challenge.completedDays.includes(day)) return 0;

        const challengeInfo = getChallengeById(challenge.challengeId);
        if (!challengeInfo) return 0;

        const newCompletedDays = [...challenge.completedDays, day];
        const isComplete = newCompletedDays.length === challengeInfo.duration;

        const dailyPoints = POINT_VALUES.challengeDayComplete;
        const bonusPoints = isComplete ? POINT_VALUES.challengeFullComplete : 0;
        const totalPointsEarned = dailyPoints + bonusPoints;

        const updatedChallenge: UserChallenge = {
          ...challenge,
          completedDays: newCompletedDays,
          pointsEarned: challenge.pointsEarned + totalPointsEarned,
          status: isComplete ? 'completed' : 'active',
          completedAt: isComplete ? getISOTimestamp() : undefined,
        };

        set({
          userChallenges: userChallenges.map(c =>
            c.id === userChallengeId ? updatedChallenge : c
          ),
        });

        return totalPointsEarned;
      },

      abandonChallenge: (userChallengeId) => {
        const { userChallenges } = get();
        set({
          userChallenges: userChallenges.map(c =>
            c.id === userChallengeId ? { ...c, status: 'abandoned' as ChallengeStatus } : c
          ),
        });
      },

      getActiveChallenge: () => {
        return get().userChallenges.find(c => c.status === 'active');
      },

      getCompletedChallenges: () => {
        return get().userChallenges.filter(c => c.status === 'completed');
      },

      getChallengeProgress: (userChallengeId) => {
        const challenge = get().userChallenges.find(c => c.id === userChallengeId);
        if (!challenge) return { current: 0, total: 0, percentage: 0 };

        const challengeInfo = getChallengeById(challenge.challengeId);
        if (!challengeInfo) return { current: 0, total: 0, percentage: 0 };

        const current = challenge.completedDays.length;
        const total = challengeInfo.duration;
        const percentage = Math.round((current / total) * 100);

        return { current, total, percentage };
      },

      getCurrentDay: (userChallengeId) => {
        const challenge = get().userChallenges.find(c => c.id === userChallengeId);
        if (!challenge) return 1;

        return Math.min(getDaysSince(challenge.startDate) + 1, 14);
      },

      isDayCompleted: (userChallengeId, day) => {
        const challenge = get().userChallenges.find(c => c.id === userChallengeId);
        return challenge?.completedDays.includes(day) ?? false;
      },

      getAvailableChallenges: () => {
        const { userChallenges } = get();
        const completedIds = userChallenges
          .filter(c => c.status === 'completed')
          .map(c => c.challengeId);

        // Return all challenges, marking completed ones
        return DEFAULT_CHALLENGES;
      },

      resetChallenges: () => {
        set({ userChallenges: [] });
      },
    }),
    {
      name: 'glowera-challenges',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
