import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, NotificationSettings, defaultNotificationSettings } from '../types/user';
import { zustandStorage } from '../utils/storage';
import { getISOTimestamp } from '../utils/dateUtils';

interface UserState {
  user: User | null;
  isOnboardingComplete: boolean;

  // Actions
  initializeUser: (gardenName: string, firstName?: string) => void;
  updateGardenName: (name: string) => void;
  updateFirstName: (name: string) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  setTheme: (themeId: string) => void;
  addPoints: (points: number) => void;
  completeOnboarding: () => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboardingComplete: false,

      initializeUser: (gardenName: string, firstName?: string) => {
        const newUser: User = {
          id: uuidv4(),
          gardenName,
          firstName: firstName?.trim() || undefined,
          createdAt: getISOTimestamp(),
          onboardingCompleted: false,
          totalPoints: 0,
          selectedTheme: 'default',
          notificationSettings: defaultNotificationSettings,
        };
        set({ user: newUser });
      },

      updateGardenName: (name: string) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, gardenName: name } });
        }
      },

      updateFirstName: (name: string) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, firstName: name.trim() || undefined } });
        }
      },

      updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              notificationSettings: { ...user.notificationSettings, ...settings },
            },
          });
        }
      },

      setTheme: (themeId: string) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, selectedTheme: themeId } });
        }
      },

      addPoints: (points: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, totalPoints: user.totalPoints + points } });
        }
      },

      completeOnboarding: () => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, onboardingCompleted: true },
            isOnboardingComplete: true,
          });
        }
      },

      resetUser: () => {
        set({ user: null, isOnboardingComplete: false });
      },
    }),
    {
      name: 'glowera-user',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
