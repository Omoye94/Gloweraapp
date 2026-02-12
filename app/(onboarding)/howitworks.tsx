import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing, borderRadius } from '../../src/theme';
import { Card, PrimaryButton } from '../../src/components/onboarding';

const STEPS = [
  {
    number: '1',
    text: 'Choose 3–5 habits that feel good',
  },
  {
    number: '2',
    text: 'Check in gently (gently or fully)',
  },
  {
    number: '3',
    text: 'Watch your Glow Garden grow',
  },
  {
    number: '4',
    text: 'Build consistency without pressure',
  },
];

export default function HowItWorksScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/(onboarding)/notifications');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.headline}>
            Here's how Glowera supports you
          </Text>

          <Card style={styles.card}>
            {STEPS.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.stepItem,
                  index < STEPS.length - 1 && styles.stepItemBorder,
                ]}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="I'm ready"
            onPress={handleContinue}
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
    paddingVertical: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  stepItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 164, 200, 0.15)',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    lineHeight: 22,
  },
  bottomSection: {
    paddingTop: spacing.lg,
  },
});
