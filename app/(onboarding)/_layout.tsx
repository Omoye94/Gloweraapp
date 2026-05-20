import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../src/theme';

const STEPS = ['problem', 'solution', 'focus', 'rituals', 'firstgrowth', 'firstreflection', 'analyzing', 'results', 'paywall', 'notifications', 'welcome'];

function ProgressBar({ currentStep }: { currentStep: number }) {
  const progress = (currentStep + 1) / STEPS.length;
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={['#F2B4CC', '#E87FA6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
}

function OnboardingHeader() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();

  const currentScreen = segments[segments.length - 1] || 'problem';
  const currentStep = STEPS.indexOf(currentScreen);
  const isFirstScreen = currentStep === 0;
  const hideProgress = currentStep < 0;

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={styles.wordmark}>glowera</Text>
      {!hideProgress && (
        <View style={styles.headerRow}>
          {!isFirstScreen ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <Text style={styles.backButtonText}>←</Text>
            </Pressable>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}
          <ProgressBar currentStep={currentStep} />
          <View style={styles.backButtonPlaceholder} />
        </View>
      )}
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <View style={styles.container}>
      <OnboardingHeader />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="problem" />
        <Stack.Screen name="reframe" />
        <Stack.Screen name="solution" />
        <Stack.Screen name="garden" />
        <Stack.Screen name="focus" />
        <Stack.Screen name="rituals" />
        <Stack.Screen name="supplements" />
        <Stack.Screen name="challenges" />
        <Stack.Screen name="firstreflection" />
        <Stack.Screen name="firstgrowth" />
        <Stack.Screen name="analyzing" />
        <Stack.Screen name="results" />
        <Stack.Screen name="socialproof" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="welcome" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1028',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  wordmark: {
    fontSize: 22,
    fontFamily: 'Raleway-Regular',
    color: '#E87FA6',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  backButtonText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '300',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
