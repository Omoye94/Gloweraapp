import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PlantState, GrowthStage, STAGE_ORDER, CosmeticType, COSMETIC_UNLOCKS, GROWTH_THRESHOLDS } from '../types/plant';
import { zustandStorage } from '../utils/storage';
import { getISOTimestamp } from '../utils/dateUtils';
import { formatDateKey } from '../utils/dateUtils';
import {
  getGrowthStage,
  getProgressToNextStage,
  getPointsToNextStage,
  getPrestigePoints,
  getShowUpBonus,
  getNewStreakMilestones,
  calculateCappedActionPoints,
} from '../utils/pointsCalculator';

interface DailyActivityResult {
  showUpBonus: number;
  streakBonuses: { days: number; bonus: number }[];
  isFirstActivityToday: boolean;
}

interface PlantStoreState {
  plant: PlantState;

  // Actions
  addPoints: (points: number, isActionPoints?: boolean) => GrowthStage | null;
  recordDailyActivity: () => DailyActivityResult;
  setPlantStyle: (styleId: string) => void;
  setActiveCosmetic: (type: CosmeticType, id: string) => void;
  setGardenTheme: (themeId: string) => void;
  checkYearRollover: () => void;

  // Queries
  getProgressToNext: () => number;
  getPointsToNext: () => number;
  getPrestigePoints: () => number;
  getUnlockedCosmetics: () => typeof COSMETIC_UNLOCKS;
  getNextCosmeticUnlock: () => (typeof COSMETIC_UNLOCKS)[number] | null;
  getDailyActionPoints: () => number;

  // Reset
  resetPlant: () => void;
}

const initialPlantState: PlantState = {
  currentStage: 'seed',
  totalLifetimePoints: 0,
  plantStyle: 'default',
  stageReachedAt: {
    seed: new Date().toISOString(),
  },
  activeYear: new Date().getFullYear(),
  gardenHistory: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    streakMilestonesHit: [],
  },
  unlockedCosmetics: [],
  activeCosmetics: {
    plantStyle: 'default',
    particleColor: 'default',
    background: 'default',
  },
  dailyActionPoints: {},
  gardenTheme: 'calm',
};

export const usePlantStore = create<PlantStoreState>()(
  persist(
    (set, get) => ({
      plant: initialPlantState,

      checkYearRollover: () => {
        const { plant } = get();
        const currentYear = new Date().getFullYear();

        if (plant.activeYear !== currentYear) {
          const archived = {
            year: plant.activeYear,
            finalStage: plant.currentStage,
            totalPoints: plant.totalLifetimePoints,
            stageReachedAt: plant.stageReachedAt,
            longestStreak: plant.streak.longestStreak,
          };

          set({
            plant: {
              ...initialPlantState,
              activeYear: currentYear,
              gardenHistory: [...plant.gardenHistory, archived],
              plantStyle: plant.plantStyle,
              stageReachedAt: { seed: new Date().toISOString() },
              // Preserve unlocked cosmetics and active selections across years
              unlockedCosmetics: plant.unlockedCosmetics,
              activeCosmetics: plant.activeCosmetics,
            },
          });
        }
      },

      recordDailyActivity: (): DailyActivityResult => {
        const { plant, addPoints } = get();
        const today = formatDateKey();

        // Already recorded activity today
        if (plant.streak.lastActiveDate === today) {
          return { showUpBonus: 0, streakBonuses: [], isFirstActivityToday: false };
        }

        // Update streak
        const yesterday = formatDateKey(
          new Date(new Date().setDate(new Date().getDate() - 1))
        );

        let newStreak: number;
        if (plant.streak.lastActiveDate === yesterday) {
          newStreak = plant.streak.currentStreak + 1;
        } else if (plant.streak.lastActiveDate === null) {
          newStreak = 1;
        } else {
          newStreak = 1; // streak broken
        }

        // Calculate show-up bonus based on new streak
        const showUpBonus = getShowUpBonus(newStreak);

        // Check for new streak milestones
        const streakBonuses = getNewStreakMilestones(
          newStreak,
          plant.streak.streakMilestonesHit
        );

        const newMilestonesDays = streakBonuses.map(m => m.days);
        const totalStreakBonus = streakBonuses.reduce((sum, m) => sum + m.bonus, 0);

        // Update streak state
        set({
          plant: {
            ...get().plant,
            streak: {
              currentStreak: newStreak,
              longestStreak: Math.max(plant.streak.longestStreak, newStreak),
              lastActiveDate: today,
              streakMilestonesHit: [
                ...plant.streak.streakMilestonesHit,
                ...newMilestonesDays,
              ],
            },
          },
        });

        // Award show-up bonus + streak milestone bonuses (uncapped)
        const totalBonus = showUpBonus + totalStreakBonus;
        if (totalBonus > 0) {
          addPoints(totalBonus, false);
        }

        // Log journey milestone events for streak milestones
        if (newMilestonesDays.length > 0) {
          const { useJourneyStore } = require('./useJourneyStore');
          for (const days of newMilestonesDays) {
            useJourneyStore.getState().addEvent({
              user_id: '',
              event_type: 'milestone',
              title: `${days}-day streak!`,
              description: `You've shown up for ${days} days in a row. Keep glowing!`,
              icon: '🔥',
            });
          }
        }

        return { showUpBonus, streakBonuses, isFirstActivityToday: true };
      },

      addPoints: (points: number, isActionPoints: boolean = false) => {
        // Check for year rollover before adding points
        get().checkYearRollover();

        const { plant } = get();
        const today = formatDateKey();

        let effectivePoints = points;

        if (isActionPoints) {
          const currentDayPoints = plant.dailyActionPoints[today] || 0;
          effectivePoints = calculateCappedActionPoints(points, currentDayPoints);
          if (effectivePoints <= 0) return null;
        }

        const newTotalPoints = plant.totalLifetimePoints + effectivePoints;
        const oldStage = plant.currentStage;
        const newStage = getGrowthStage(newTotalPoints);

        const leveledUp = STAGE_ORDER.indexOf(newStage) > STAGE_ORDER.indexOf(oldStage);

        // Check for new cosmetic unlocks
        const prestigePts = getPrestigePoints(newTotalPoints);
        const newUnlocks = COSMETIC_UNLOCKS.filter(
          c =>
            prestigePts >= c.prestigePointsRequired &&
            !plant.unlockedCosmetics.includes(c.id)
        );

        // Update daily action points tracking
        const updatedDailyActionPoints = isActionPoints
          ? {
              ...plant.dailyActionPoints,
              [today]: (plant.dailyActionPoints[today] || 0) + effectivePoints,
            }
          : plant.dailyActionPoints;

        // Prune old daily entries (keep last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const cutoffKey = formatDateKey(sevenDaysAgo);
        const prunedDailyPoints: Record<string, number> = {};
        for (const [key, val] of Object.entries(updatedDailyActionPoints)) {
          if (key >= cutoffKey) {
            prunedDailyPoints[key] = val;
          }
        }

        const updatedPlant: PlantState = {
          ...plant,
          totalLifetimePoints: newTotalPoints,
          currentStage: newStage,
          stageReachedAt: leveledUp
            ? { ...plant.stageReachedAt, [newStage]: getISOTimestamp() }
            : plant.stageReachedAt,
          dailyActionPoints: prunedDailyPoints,
          unlockedCosmetics:
            newUnlocks.length > 0
              ? [...plant.unlockedCosmetics, ...newUnlocks.map(c => c.id)]
              : plant.unlockedCosmetics,
        };

        set({ plant: updatedPlant });

        if (leveledUp) {
          const { useJourneyStore } = require('./useJourneyStore');
          useJourneyStore.getState().addEvent({
            user_id: '',
            event_type: 'garden_stage',
            title: `Your garden reached ${newStage}!`,
            description: `You've grown from ${oldStage} to ${newStage} with ${newTotalPoints} total points.`,
            icon: '🌱',
          });
        }

        return leveledUp ? newStage : null;
      },

      setPlantStyle: (styleId: string) => {
        const { plant } = get();
        set({ plant: { ...plant, plantStyle: styleId } });
      },

      setGardenTheme: (themeId: string) => {
        const { plant } = get();
        set({ plant: { ...plant, gardenTheme: themeId } });
      },

      setActiveCosmetic: (type: CosmeticType, id: string) => {
        const { plant } = get();
        const key =
          type === 'particle_color'
            ? 'particleColor'
            : type === 'plant_style'
              ? 'plantStyle'
              : 'background';
        set({
          plant: {
            ...plant,
            activeCosmetics: {
              ...plant.activeCosmetics,
              [key]: id,
            },
          },
        });
      },

      getProgressToNext: () => {
        const { plant } = get();
        return getProgressToNextStage(plant.totalLifetimePoints);
      },

      getPointsToNext: () => {
        const { plant } = get();
        return getPointsToNextStage(plant.totalLifetimePoints);
      },

      getPrestigePoints: () => {
        const { plant } = get();
        return getPrestigePoints(plant.totalLifetimePoints);
      },

      getUnlockedCosmetics: () => {
        const { plant } = get();
        return COSMETIC_UNLOCKS.filter(c =>
          plant.unlockedCosmetics.includes(c.id)
        );
      },

      getNextCosmeticUnlock: () => {
        const { plant } = get();
        const prestigePts = getPrestigePoints(plant.totalLifetimePoints);
        return (
          COSMETIC_UNLOCKS.find(
            c =>
              !plant.unlockedCosmetics.includes(c.id) &&
              c.prestigePointsRequired > prestigePts
          ) ?? null
        );
      },

      getDailyActionPoints: () => {
        const { plant } = get();
        const today = formatDateKey();
        return plant.dailyActionPoints[today] || 0;
      },

      resetPlant: () => {
        set({ plant: initialPlantState });
      },
    }),
    {
      name: 'glowera-plant',
      storage: createJSONStorage(() => zustandStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 || version === undefined) {
          persistedState = {
            ...persistedState,
            plant: {
              ...persistedState.plant,
              activeYear: new Date().getFullYear(),
              gardenHistory: [],
            },
          };
        }
        if (version < 2) {
          // Scale old points to match new thresholds (700 old max → 12000 new max)
          const oldPoints = persistedState.plant?.totalLifetimePoints || 0;
          const scaledPoints = Math.round(oldPoints * 17.14);

          persistedState = {
            ...persistedState,
            plant: {
              ...persistedState.plant,
              totalLifetimePoints: scaledPoints,
              currentStage: getGrowthStage(scaledPoints),
              streak: {
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                streakMilestonesHit: [],
              },
              unlockedCosmetics: [],
              activeCosmetics: {
                plantStyle: 'default',
                particleColor: 'default',
                background: 'default',
              },
              dailyActionPoints: {},
            },
          };
        }
        return persistedState;
      },
    }
  )
);
