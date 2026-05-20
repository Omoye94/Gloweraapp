import 'react-native-get-random-values';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useFonts } from 'expo-font';
import { spacing, borderRadius, gloweraScreen } from '../src/theme';
import { ThemeProvider, useTheme } from '../src/context';
import { useBootstrap } from '../src/hooks/useBootstrap';
import { useJourneyStore } from '../src/stores';
import { initPurchases } from '../src/lib/purchases';

// Conditionally import GestureHandler for native only
let GestureHandlerRootView: any = View;
if (Platform.OS !== 'web') {
  GestureHandlerRootView =
    require('react-native-gesture-handler').GestureHandlerRootView;
}

function LoadingScreen() {
  const { colors: screenColors } = gloweraScreen;

  return (
    <View style={[styles.loadingContainer, { backgroundColor: screenColors.backgroundDeep }]}>
      <View style={styles.loadingContent}>
        <Image
          source={require('../assets/Logo-Backgrounds-01.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color={screenColors.primarySoft}
          style={styles.spinner}
        />
        <Text style={[styles.loadingText, { color: screenColors.primarySoft }]}>
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
  const { status, isLoading, error, refresh, isAuthenticated } = useBootstrap();
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
        // Authenticated users are in onboarding for preview — always let them stay
        if (isAuthenticated) return;
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const onboardingPreview = await AsyncStorage.getItem('glowera-onboarding-preview');
        if (onboardingPreview === 'true') {
          console.log('[Layout] Preview onboarding active, staying in onboarding flow');
          return;
        }
        const onboardingComplete = await AsyncStorage.getItem('glowera-onboarding-complete');
        if (onboardingComplete !== 'true') {
          console.log('[Layout] User reset onboarding, staying in onboarding flow');
          return;
        }
      }

      switch (status) {
        case 'needs_onboarding':
          // The final onboarding screen writes the local completion flag before
          // the bootstrap hook has necessarily re-read it. If navigation reaches
          // tabs during that moment, trust the persisted flag and refresh.
          {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const onboardingComplete = await AsyncStorage.getItem('glowera-onboarding-complete');
            if (onboardingComplete === 'true') {
              console.log('[Layout] Local onboarding flag found; refreshing bootstrap and entering tabs');
              refresh();
              if (!inTabsGroup) {
                router.replace('/(tabs)');
              }
              return;
            }
          }

          // New user — show landing page first, then onboarding
          if (!inOnboardingGroup && !inAuthGroup) {
            console.log('[Layout] Redirecting to /(auth)/welcome');
            router.replace('/(auth)/welcome');
          }
          break;

        case 'ready':
          if (!isAuthenticated) {
            // Local onboarding unlocks the app shell before account creation.
            // Logout still lands in the auth group, where this guard leaves it alone.
            if (inTabsGroup || inAuthGroup) {
              return;
            }

            if (inOnboardingGroup) {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              const onboardingPreview = await AsyncStorage.getItem('glowera-onboarding-preview');
              if (onboardingPreview === 'true') {
                console.log('[Layout] Preview onboarding active, staying in onboarding flow');
                return;
              }
              const onboardingComplete = await AsyncStorage.getItem('glowera-onboarding-complete');
              if (onboardingComplete === 'true') {
                console.log('[Layout] Local onboarding complete; entering tabs');
                router.replace('/(tabs)');
              }
              return;
            }

            console.log('[Layout] Signed out and ready; entering local app shell');
            router.replace('/(tabs)');
            break;
          }

          // Check for future self messages to deliver
          useJourneyStore.getState().checkFutureMessages();

          // Authenticated users can be in onboarding (preview mode) — only redirect from auth.
          if (!inTabsGroup && !inOnboardingGroup) {
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
  }, [status, isLoading, isAuthenticated, segments, router]);

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
          name="welcome-preview"
          options={{ headerShown: false, animation: 'fade' }}
        />
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
  useEffect(() => {
    // Initialize RevenueCat as early as possible
    initPurchases().catch((error) => {
      console.warn('[Layout] Purchase initialization skipped:', error);
    });
  }, []);

  const [fontsLoaded] = useFonts({
    'DMSans': require('../assets/fonts/DMSans.ttf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'SpaceMono-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
    'Optima-Regular': require('../assets/fonts/Optima-Regular.ttf'),
    'Optima-Medium':  require('../assets/fonts/Optima-Medium.ttf'),
    'Optima-Bold':    require('../assets/fonts/Optima-Bold.ttf'),
    'Optima-Italic':  require('../assets/fonts/Optima-Italic.ttf'),
    'Raleway-Regular':   require('../assets/fonts/Raleway-Regular.ttf'),
    'Raleway-SemiBold':  require('../assets/fonts/Raleway-SemiBold.ttf'),
    'Raleway-Bold':      require('../assets/fonts/Raleway-Bold.ttf'),
    'PlayfairDisplay':         require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-Italic':  require('../assets/fonts/PlayfairDisplay-Italic.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

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
  loadingLogo: {
    width: 220,
    height: 220,
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
