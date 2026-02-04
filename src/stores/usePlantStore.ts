import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PlantState, GrowthStage, STAGE_ORDER } from '../types/plant';
import { zustandStorage } from '../utils/storage';
import { getISOTimestamp } from '../utils/dateUtils';
import { getGrowthStage, getProgressToNextStage, getPointsToNextStage } from '../utils/pointsCalculator';

interface PlantStoreState {
  plant: PlantState;

  // Actions
  addPoints: (points: number) => GrowthStage | null; // Returns new stage if leveled up
  setPlantStyle: (styleId: string) => void;

  // Queries
  getProgressToNext: () => number;
  getPointsToNext: () => number;

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
};

export const usePlantStore = create<PlantStoreState>()(
  persist(
    (set, get) => ({
      plant: initialPlantState,

      addPoints: (points: number) => {
        const { plant } = get();
        const newTotalPoints = plant.totalLifetimePoints + points;
        const oldStage = plant.currentStage;
        const newStage = getGrowthStage(newTotalPoints);

        // Check if we leveled up
        const leveledUp = STAGE_ORDER.indexOf(newStage) > STAGE_ORDER.indexOf(oldStage);

        const updatedPlant: PlantState = {
          ...plant,
          totalLifetimePoints: newTotalPoints,
          currentStage: newStage,
          stageReachedAt: leveledUp
            ? { ...plant.stageReachedAt, [newStage]: getISOTimestamp() }
            : plant.stageReachedAt,
        };

        set({ plant: updatedPlant });

        return leveledUp ? newStage : null;
      },

      setPlantStyle: (styleId: string) => {
        const { plant } = get();
        set({ plant: { ...plant, plantStyle: styleId } });
      },

      getProgressToNext: () => {
        const { plant } = get();
        return getProgressToNextStage(plant.totalLifetimePoints);
      },

      getPointsToNext: () => {
        const { plant } = get();
        return getPointsToNextStage(plant.totalLifetimePoints);
      },

      resetPlant: () => {
        set({ plant: initialPlantState });
      },
    }),
    {
      name: 'glowera-plant',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
