import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing } from '../../src/theme';
import { Card, PrimaryButton, ChecklistItem } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const VALIDATION_ITEMS = [
  "I start habits but don't stay consistent",
  "I feel overwhelmed by doing it all",
  "I want routines, but not pressure",
  "I forget to check in with myself",
  "I want wellness to feel softer",
];

export default function ValidationScreen() {
  const router = useRouter();
  const { validation_items, toggleValidationItem } = useOnboardingStore();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.headline}>Does this sound like you?</Text>

          <Card style={styles.card}>
            {VALIDATION_ITEMS.map((item) => (
              <ChecklistItem
                key={item}
                label={item}
                checked={validation_items.includes(item)}
                onPress={() => toggleValidationItem(item)}
              />
            ))}
          </Card>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Yes, that's me"
            onPress={() => router.push('/(onboarding)/solution')}
            disabled={validation_items.length === 0}
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
  },
  card: {
    paddingVertical: spacing.md,
  },
  bottomSection: {
    paddingTop: spacing.lg,
  },
});
