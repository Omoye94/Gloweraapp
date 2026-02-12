import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing } from '../../src/theme';
import { Card, PrimaryButton, ChecklistItem } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const RITUAL_OPTIONS = [
  { label: 'Drink water', icon: '💧' },
  { label: 'Move your body', icon: '🏃‍♀️' },
  { label: 'Take supplements', icon: '💊' },
  { label: 'Read or learn', icon: '📚' },
  { label: 'Stretch', icon: '🧘‍♀️' },
  { label: 'Morning routine', icon: '🌅' },
  { label: 'Evening wind-down', icon: '🌙' },
];

export default function RitualsScreen() {
  const router = useRouter();
  const { selected_rituals, toggleRitual } = useOnboardingStore();

  const isValid = selected_rituals.length >= 3;
  const isMaxed = selected_rituals.length >= 5;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.headline}>
            Pick 3–5 rituals that feel good
          </Text>
          <Text style={styles.counter}>
            {selected_rituals.length} of 5 selected
          </Text>

          <Card style={styles.card}>
            {RITUAL_OPTIONS.map((ritual) => {
              const isSelected = selected_rituals.includes(ritual.label);
              const isDisabled = isMaxed && !isSelected;

              return (
                <ChecklistItem
                  key={ritual.label}
                  label={`${ritual.icon}  ${ritual.label}`}
                  checked={isSelected}
                  onPress={() => {
                    if (!isDisabled) {
                      toggleRitual(ritual.label);
                    }
                  }}
                />
              );
            })}
          </Card>

          {!isValid && (
            <Text style={styles.helper}>
              Select at least 3 rituals to continue
            </Text>
          )}
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Continue"
            onPress={() => router.push('/(onboarding)/howitworks')}
            disabled={!isValid}
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
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  counter: {
    fontSize: 15,
    color: theme.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
  card: {
    paddingVertical: spacing.sm,
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
