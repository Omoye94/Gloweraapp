import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing, borderRadius } from '../../src/theme';
import { Card, PrimaryButton } from '../../src/components/onboarding';

export default function ProblemScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Card style={styles.card}>
            <Text style={styles.headline}>
              Taking care of yourself shouldn't feel hard.
            </Text>
            <Text style={styles.body}>
              Most wellness apps push streaks, pressure, and perfection. Missing a day can feel like failure.
            </Text>
            <Text style={styles.highlight}>
              Glowera is different.
            </Text>
          </Card>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Continue"
            onPress={() => router.push('/(onboarding)/validation')}
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
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  card: {
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  body: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  highlight: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.primary,
    textAlign: 'center',
  },
  bottomSection: {
    paddingTop: spacing.lg,
  },
});
