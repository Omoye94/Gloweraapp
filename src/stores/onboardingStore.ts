import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  validation_items: string[];
  focus_areas: string[];
  selected_rituals: string[];
  currentStep: number;
}

interface OnboardingActions {
  setValidationItems: (items: string[]) => void;
  toggleValidationItem: (item: string) => void;
  setFocusAreas: (areas: string[]) => void;
  toggleFocusArea: (area: string) => void;
  setSelectedRituals: (rituals: string[]) => void;
  toggleRitual: (ritual: string) => void;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => void;
}

const initialState: OnboardingState = {
  validation_items: [],
  focus_areas: [],
  selected_rituals: [],
  currentStep: 1,
};

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setValidationItems: (items) => set({ validation_items: items }),

      toggleValidationItem: (item) => {
        const current = get().validation_items;
        if (current.includes(item)) {
          set({ validation_items: current.filter((i) => i !== item) });
        } else {
          set({ validation_items: [...current, item] });
        }
      },

      setFocusAreas: (areas) => set({ focus_areas: areas }),

      toggleFocusArea: (area) => {
        const current = get().focus_areas;
        if (current.includes(area)) {
          set({ focus_areas: current.filter((a) => a !== area) });
        } else {
          set({ focus_areas: [...current, area] });
        }
      },

      setSelectedRituals: (rituals) => set({ selected_rituals: rituals }),

      toggleRitual: (ritual) => {
        const current = get().selected_rituals;
        if (current.includes(ritual)) {
          set({ selected_rituals: current.filter((r) => r !== ritual) });
        } else if (current.length < 5) {
          set({ selected_rituals: [...current, ritual] });
        }
      },

      setCurrentStep: (step) => set({ currentStep: step }),

      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'onboarding_draft',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
