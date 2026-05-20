import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing } from '../../src/theme';
import { Card, PrimaryButton } from '../../src/components/onboarding';

export default function ValidationScreen() {
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
              When everything feels disorganized, consistency becomes difficult.
            </Text>
            <Text style={styles.body}>
              You forget things. You restart routines. Nothing sticks.
            </Text>
          </Card>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Continue"
            onPress={() => router.push('/(onboarding)/reframe')}
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
  },
  bottomSection: {
    paddingTop: spacing.lg,
  },
});
