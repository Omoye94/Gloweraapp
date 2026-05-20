import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PurchasesOffering, CustomerInfo } from 'react-native-purchases';

interface SubscriptionState {
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  currentOffering: PurchasesOffering | null;
  isLoadingOfferings: boolean;
  // Actions
  setIsPremium: (isPremium: boolean) => void;
  setCustomerInfo: (info: CustomerInfo) => void;
  setCurrentOffering: (offering: PurchasesOffering | null) => void;
  setIsLoadingOfferings: (loading: boolean) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      isPremium: false,
      customerInfo: null,
      currentOffering: null,
      isLoadingOfferings: false,

      setIsPremium: (isPremium) => set({ isPremium }),
      setCustomerInfo: (customerInfo) => set({ customerInfo }),
      setCurrentOffering: (currentOffering) => set({ currentOffering }),
      setIsLoadingOfferings: (isLoadingOfferings) => set({ isLoadingOfferings }),
      reset: () =>
        set({ isPremium: false, customerInfo: null, currentOffering: null }),
    }),
    {
      name: 'glowera-subscription',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist isPremium — don't cache stale offering/customerInfo objects
      partialize: (state) => ({ isPremium: state.isPremium }),
    }
  )
);
