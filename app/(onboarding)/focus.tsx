import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing } from '../../src/theme';
import { Card, PrimaryButton, Chip } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const FOCUS_AREAS = [
  'Better routines',
  'More energy',
  'Less stress',
  'Sleep support',
  'Wellness consistency',
  'Feeling more aligned',
];

export default function FocusScreen() {
  const router = useRouter();
  const { focus_areas, toggleFocusArea } = useOnboardingStore();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.headline}>
            What are you focusing on right now?
          </Text>

          <Card style={styles.card}>
            <View style={styles.chipsContainer}>
              {FOCUS_AREAS.map((area) => (
                <Chip
                  key={area}
                  label={area}
                  selected={focus_areas.includes(area)}
                  onPress={() => toggleFocusArea(area)}
                />
              ))}
            </View>
          </Card>

          <Text style={styles.helper}>You can change this anytime.</Text>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Continue"
            onPress={() => router.push('/(onboarding)/rituals')}
            disabled={focus_areas.length === 0}
          />
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
    paddingTop: spacing.md,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  card: {
    paddingVertical: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  helper: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  bottomSection: {
    paddingTop: spacing.lg,
  },
});
