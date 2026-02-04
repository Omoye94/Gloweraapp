import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

// Zustand-compatible storage adapter using AsyncStorage
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await AsyncStorage.getItem(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

// Helper functions for typed storage
export const storageHelpers = {
  getString: async (key: string): Promise<string | null> => {
    return AsyncStorage.getItem(key);
  },
  setString: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(key, value);
  },

  getNumber: async (key: string): Promise<number | null> => {
    const val = await AsyncStorage.getItem(key);
    return val ? Number(val) : null;
  },
  setNumber: async (key: string, value: number): Promise<void> => {
    await AsyncStorage.setItem(key, String(value));
  },

  getBoolean: async (key: string): Promise<boolean | null> => {
    const val = await AsyncStorage.getItem(key);
    return val ? val === 'true' : null;
  },
  setBoolean: async (key: string, value: boolean): Promise<void> => {
    await AsyncStorage.setItem(key, String(value));
  },

  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  setObject: async <T>(key: string, value: T): Promise<void> => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  delete: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  },

  clearAll: async (): Promise<void> => {
    await AsyncStorage.clear();
  },

  getAllKeys: async (): Promise<readonly string[]> => {
    return AsyncStorage.getAllKeys();
  },
};
