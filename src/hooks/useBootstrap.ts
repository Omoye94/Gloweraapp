import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import {
  getUserSettings,
  clearCachedSettings,
  UserSettings,
} from '../lib/userSettings';
import { ensureScheduledFromSettings, scheduleGardenReengagement } from '../lib/notifications';

const LOCAL_ONBOARDING_KEY = 'glowera-onboarding-complete';

export type BootstrapStatus =
  | 'loading'
  | 'needs_onboarding'
  | 'ready'
  | 'error';

export interface BootstrapState {
  status: BootstrapStatus;
  session: Session | null;
  userSettings: UserSettings | null;
  error: Error | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface UseBootstrapReturn extends BootstrapState {
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  completeLocalOnboarding: () => Promise<void>;
}

/**
 * Check if onboarding is complete locally (before auth)
 */
async function isLocalOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(LOCAL_ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark local onboarding as complete
 */
async function setLocalOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error setting local onboarding:', error);
  }
}

/**
 * Clear local onboarding status
 */
async function clearLocalOnboarding(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LOCAL_ONBOARDING_KEY);
  } catch (error) {
    console.error('Error clearing local onboarding:', error);
  }
}

export function useBootstrap(): UseBootstrapReturn {
  const [state, setState] = useState<BootstrapState>({
    status: 'loading',
    session: null,
    userSettings: null,
    error: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const bootstrap = useCallback(async () => {
    console.log('[Bootstrap] Starting bootstrap...');
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Check local onboarding status first (before auth check)
      const localOnboardingDone = await isLocalOnboardingComplete();
      console.log('[Bootstrap] Local onboarding complete:', localOnboardingDone);

      // If local onboarding not done, show onboarding (no auth needed)
      if (!localOnboardingDone) {
        console.log('[Bootstrap] Needs onboarding (local check)');
        setState({
          status: 'needs_onboarding',
          session: null,
          userSettings: null,
          error: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // Step 2: Onboarding done locally, check for auth session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log('[Bootstrap] Session:', session ? 'exists' : 'null');

      if (sessionError) {
        console.error('[Bootstrap] Session error:', sessionError);
        // Don't throw - just proceed without auth
      }

      // Step 3: If authenticated, try to get user settings from Supabase
      let userSettings: UserSettings | null = null;
      if (session) {
        console.log('[Bootstrap] Fetching user settings for:', session.user.id);
        const { settings } = await getUserSettings(session.user.id);
        userSettings = settings;
        console.log('[Bootstrap] User settings:', settings);

        // Step 3.5: Ensure notifications are scheduled based on settings
        if (settings) {
          await ensureScheduledFromSettings({
            reminders_enabled: settings.reminders_enabled ?? false,
            daily_reminder_time: settings.daily_reminder_time ?? null,
          });
        }
      }

      // Step 4: Ready to use the app — reset the re-engagement countdown
      scheduleGardenReengagement();
      console.log('[Bootstrap] Ready, authenticated:', !!session);
      setState({
        status: 'ready',
        session: session,
        userSettings,
        error: null,
        isLoading: false,
        isAuthenticated: !!session,
      });
    } catch (error) {
      console.error('[Bootstrap] Error:', error);
      setState({
        status: 'error',
        session: null,
        userSettings: null,
        error: error as Error,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      await clearCachedSettings();
      // Don't clear local onboarding - user already completed it
      setState((prev) => ({
        ...prev,
        session: null,
        userSettings: null,
        isAuthenticated: false,
      }));
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const completeLocalOnboarding = useCallback(async () => {
    await setLocalOnboardingComplete();
    // Re-bootstrap to update status
    bootstrap();
  }, [bootstrap]);

  // Initial bootstrap
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Bootstrap] Auth state changed:', event);

      if (event === 'SIGNED_OUT') {
        await clearCachedSettings();
        setState((prev) => ({
          ...prev,
          session: null,
          userSettings: null,
          isAuthenticated: false,
        }));
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Re-bootstrap on sign in or token refresh
        bootstrap();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [bootstrap]);

  return {
    ...state,
    refresh: bootstrap,
    signOut,
    completeLocalOnboarding,
  };
}
