import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, spacing, borderRadius } from '../../src/theme';
import { Card, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useHabitStore, useUserStore } from '../../src/stores';
import { requestPermission, scheduleDaily } from '../../src/lib/notifications';
import { supabase } from '../../lib/supabase';

const LOCAL_ONBOARDING_KEY = 'glowera-onboarding-complete';

export default function NotificationsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { selected_rituals, resetOnboarding } = useOnboardingStore();
  const { addHabit } = useHabitStore();
  const { initializeUser } = useUserStore();

  const completeOnboarding = async (remindersEnabled: boolean) => {
    setIsLoading(true);

    try {
      // Add selected rituals as habits
      const iconMap: Record<string, string> = {
        'Drink water': '💧',
        'Move your body': '🏃‍♀️',
        'Take supplements': '💊',
        'Read or learn': '📚',
        'Stretch': '🧘‍♀️',
        'Morning routine': '🌅',
        'Evening wind-down': '🌙',
      };

      const categoryMap: Record<string, string> = {
        'Drink water': 'nutrition',
        'Move your body': 'movement',
        'Take supplements': 'supplements',
        'Read or learn': 'hobbies',
        'Stretch': 'movement',
        'Morning routine': 'self-care',
        'Evening wind-down': 'self-care',
      };

      selected_rituals.forEach((ritual) => {
        addHabit({
          name: ritual,
          icon: iconMap[ritual] || '✨',
          category: (categoryMap[ritual] || 'self-care') as any,
          isCustom: false,
        });
      });

      // Initialize user
      initializeUser('My Garden');

      // Try to update Supabase user_settings if authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('users')
          .upsert({
            id: session.user.id,
            onboarding_completed: true,
            reminders_enabled: remindersEnabled,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
      }

      // Mark local onboarding as complete
      await AsyncStorage.setItem(LOCAL_ONBOARDING_KEY, 'true');

      // Clear onboarding draft
      resetOnboarding();

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[Notifications] Error completing onboarding:', error);
      // Still navigate even if Supabase update fails
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableReminders = async () => {
    setIsLoading(true);

    try {
      const granted = await requestPermission();

      if (granted) {
        // Schedule both morning (8 AM) and evening (9 PM) notifications
        await scheduleDaily();
        await completeOnboarding(true);
      } else {
        // Permission not granted
        await completeOnboarding(false);
      }
    } catch (error) {
      console.error('[Notifications] Error enabling reminders:', error);
      await completeOnboarding(false);
    }
  };

  const handleNotNow = async () => {
    await completeOnboarding(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.headline}>Want gentle reminders?</Text>
          <Text style={styles.body}>
            We'll send you a morning and evening reminder — never guilt, never pressure.
          </Text>

          <Card style={styles.card}>
            {/* Morning notification preview */}
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewApp}>GLOWERA</Text>
                <Text style={styles.previewTime}>8:00 AM</Text>
              </View>
              <Text style={styles.previewTitle}>Glowera ✨</Text>
              <Text style={styles.previewBody}>Good morning! Time for your glow ritual.</Text>
            </View>

            <View style={styles.previewDivider} />

            {/* Evening notification preview */}
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewApp}>GLOWERA</Text>
                <Text style={styles.previewTime}>9:00 PM</Text>
              </View>
              <Text style={styles.previewTitle}>Glowera 🌙</Text>
              <Text style={styles.previewBody}>Wind down time. How did your day glow?</Text>
            </View>
          </Card>
        </View>

        <View style={styles.bottomSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={styles.loadingText}>Setting up your garden...</Text>
            </View>
          ) : (
            <>
              <PrimaryButton
                title="Enable reminders"
                onPress={handleEnableReminders}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
                onPress={handleNotNow}
              >
                <Text style={styles.secondaryButtonText}>Not now</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  card: {
    width: '100%',
  },
  previewContainer: {
    backgroundColor: 'rgba(232, 164, 200, 0.08)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  previewDivider: {
    height: spacing.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  previewApp: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
  previewTime: {
    fontSize: 11,
    color: theme.textMuted,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  previewBody: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  bottomSection: {
    gap: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: theme.textSecondary,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textSecondary,
  },
});
