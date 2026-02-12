import 'react-native-get-random-values';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { spacing, borderRadius } from '../src/theme';
import { ThemeProvider, useTheme } from '../src/context';
import { useBootstrap } from '../src/hooks/useBootstrap';

// Conditionally import GestureHandler for native only
let GestureHandlerRootView: any = View;
if (Platform.OS !== 'web') {
  GestureHandlerRootView =
    require('react-native-gesture-handler').GestureHandlerRootView;
}

function LoadingScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
      <View style={styles.loadingContent}>
        <Text style={styles.loadingEmoji}>🌱</Text>
        <Text style={[styles.loadingTitle, { color: theme.text }]}>Glowera</Text>
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={styles.spinner}
        />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Preparing your garden...
        </Text>
      </View>
    </View>
  );
}

function ErrorScreen({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
      <View style={styles.errorContent}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={[styles.errorTitle, { color: theme.text }]}>
          Something went wrong
        </Text>
        <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
          {error?.message || 'Unable to connect. Please check your internet connection.'}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: theme.primary },
            pressed && styles.retryButtonPressed,
          ]}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { status, isLoading, error, refresh } = useBootstrap();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const handleRouting = async () => {
      console.log('[Layout] Status:', status, 'isLoading:', isLoading, 'segments:', segments);

      if (isLoading) return;

      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === '(onboarding)';
      const inTabsGroup = segments[0] === '(tabs)';

      console.log('[Layout] inAuthGroup:', inAuthGroup, 'inOnboardingGroup:', inOnboardingGroup, 'inTabsGroup:', inTabsGroup);

      // If user is in onboarding group, check if they should stay there
      // (handles the case where user reset onboarding from profile)
      if (inOnboardingGroup && status === 'ready') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const onboardingComplete = await AsyncStorage.getItem('glowera-onboarding-complete');
        if (onboardingComplete !== 'true') {
          console.log('[Layout] User reset onboarding, staying in onboarding flow');
          return; // Stay in onboarding
        }
      }

      switch (status) {
        case 'needs_onboarding':
          // User hasn't completed onboarding yet (no auth needed)
          if (!inOnboardingGroup) {
            console.log('[Layout] Redirecting to /(onboarding)/problem');
            router.replace('/(onboarding)/problem');
          }
          break;

        case 'ready':
          // User has completed onboarding, go to main app
          if (!inTabsGroup && !inAuthGroup) {
            console.log('[Layout] Redirecting to /(tabs)');
            router.replace('/(tabs)');
          }
          break;

        case 'error':
          // Stay on current screen, error UI will show
          console.log('[Layout] Error state, staying on current screen');
          break;
      }
    };

    handleRouting();
  }, [status, isLoading, segments, router]);

  // Show loading screen while bootstrapping
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show error screen if bootstrap failed
  if (status === 'error') {
    return <ErrorScreen error={error} onRetry={refresh} />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="(auth)"
          options={{
            gestureEnabled: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="(onboarding)"
          options={{
            gestureEnabled: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            gestureEnabled: false,
            animation: 'fade',
          }}
        />
      </Stack>
    </>
  );
}

function RootLayoutContent() {
  const { theme } = useTheme();

  return (
    <GestureHandlerRootView style={[styles.container, { backgroundColor: theme.background }]}>
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  loadingText: {
    fontSize: 16,
  },
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  retryButton: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.pill,
  },
  retryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
