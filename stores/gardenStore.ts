import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Plant, PlantGrowthStage } from '../types';
import { getPlantStage, getProgressToNextStage } from '../lib/utils';
import { PLANT_GROWTH_MESSAGES } from '../lib/constants';

interface GardenState {
  plant: Plant | null;
  isLoading: boolean;
  showGrowthAnimation: boolean;
  lastGrowthMessage: string | null;

  // Actions
  fetchPlant: (userId: string) => Promise<void>;
  updatePlantStage: () => Promise<void>;
  triggerGrowthAnimation: () => void;
  dismissGrowthAnimation: () => void;
  getProgressPercentage: () => number;
  getCurrentStageMessage: () => string;
}

export const useGardenStore = create<GardenState>((set, get) => ({
  plant: null,
  isLoading: false,
  showGrowthAnimation: false,
  lastGrowthMessage: null,

  fetchPlant: async (userId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const plant = data as Plant;
      const newStage = getPlantStage(plant.growth_points);

      // Check if plant should level up
      if (newStage !== plant.growth_stage) {
        set({
          plant: { ...plant, growth_stage: newStage },
          lastGrowthMessage: PLANT_GROWTH_MESSAGES[newStage],
          showGrowthAnimation: true,
        });

        // Update stage in database
        await supabase
          .from('plants')
          .update({ growth_stage: newStage })
          .eq('id', plant.id);
      } else {
        set({ plant });
      }
    } catch (error) {
      console.error('Error fetching plant:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updatePlantStage: async () => {
    const { plant } = get();
    if (!plant) return;

    const newStage = getPlantStage(plant.growth_points);

    if (newStage !== plant.growth_stage) {
      try {
        const { error } = await supabase
          .from('plants')
          .update({ growth_stage: newStage })
          .eq('id', plant.id);

        if (error) throw error;

        set({
          plant: { ...plant, growth_stage: newStage },
          lastGrowthMessage: PLANT_GROWTH_MESSAGES[newStage],
          showGrowthAnimation: true,
        });
      } catch (error) {
        console.error('Error updating plant stage:', error);
      }
    }
  },

  triggerGrowthAnimation: () => {
    set({ showGrowthAnimation: true });
  },

  dismissGrowthAnimation: () => {
    set({ showGrowthAnimation: false, lastGrowthMessage: null });
  },

  getProgressPercentage: () => {
    const { plant } = get();
    if (!plant) return 0;
    return getProgressToNextStage(plant.growth_points);
  },

  getCurrentStageMessage: () => {
    const { plant } = get();
    if (!plant) return PLANT_GROWTH_MESSAGES.seed;
    return PLANT_GROWTH_MESSAGES[plant.growth_stage];
  },
}));
