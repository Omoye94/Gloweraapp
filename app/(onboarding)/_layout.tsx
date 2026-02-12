import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, spacing } from '../../src/theme';

const STEPS = ['problem', 'validation', 'solution', 'focus', 'rituals', 'howitworks', 'notifications'];

function ProgressDots({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.progressContainer}>
      {STEPS.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < currentStep && styles.dotCompleted,
            index === currentStep && styles.dotActive,
          ]}
        />
      ))}
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

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.headerRow}>
        {!isFirstScreen ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <ProgressDots currentStep={currentStep} />
        <View style={styles.backButtonPlaceholder} />
      </View>
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FDF6F8', '#FAE8ED', '#F5EBF8']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <OnboardingHeader />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="problem" />
        <Stack.Screen name="validation" />
        <Stack.Screen name="solution" />
        <Stack.Screen name="focus" />
        <Stack.Screen name="rituals" />
        <Stack.Screen name="howitworks" />
        <Stack.Screen name="notifications" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  backButtonText: {
    fontSize: 24,
    color: theme.text,
    fontWeight: '300',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(232, 164, 200, 0.3)',
  },
  dotCompleted: {
    backgroundColor: theme.primary,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.primary,
  },
});
