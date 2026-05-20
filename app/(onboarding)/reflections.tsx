import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing, borderRadius } from '../../src/theme';
import { Card, PrimaryButton } from '../../src/components/onboarding';

export default function ReflectionsPreviewScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.headline}>
            Reflect whenever you need clarity.
          </Text>
          <Text style={styles.body}>
            Short reflections help you stay connected to your habits.
          </Text>

          <Card style={styles.card}>
            <View style={styles.promptPreview}>
              <Text style={styles.promptLabel}>TODAY'S PROMPT</Text>
              <Text style={styles.promptText}>
                "How are you arriving today?"
              </Text>
            </View>
            <View style={styles.mockInput}>
              <Text style={styles.mockInputText}>Tap to write...</Text>
              <View style={styles.mockCursor} />
            </View>
          </Card>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Continue"
            onPress={() => router.push('/(onboarding)/challenges')}
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
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  headline: {
    fontSize: 26,
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  body: {
    fontSize: 16,
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  card: {
    width: '100%',
  },
  promptPreview: {
    backgroundColor: 'rgba(244, 198, 204, 0.08)',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  mockInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 164, 200, 0.06)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 60,
  },
  mockInputText: {
    fontSize: 15,
    color: theme.textMuted,
    fontStyle: 'italic',
  },
  mockCursor: {
    width: 2,
    height: 18,
    backgroundColor: theme.primary,
    marginLeft: 2,
    opacity: 0.6,
  },
  bottomSection: {
    paddingTop: spacing.lg,
  },
});
