import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, spacing, borderRadius } from '../../src/theme';
import { Card, PrimaryButton } from '../../src/components/onboarding';

const PILLARS = [
  {
    icon: '🌿',
    text: 'Gentle habits (no streaks, no punishment)',
  },
  {
    icon: '🌸',
    text: 'Care-based motivation (grow your glow garden)',
  },
  {
    icon: '💜',
    text: 'Support & accountability (at your pace)',
  },
];

export default function SolutionScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Text style={styles.headline}>Meet Glowera ✨</Text>
          <Text style={styles.subhead}>Your daily glow ritual</Text>

          <Card style={styles.card}>
            {PILLARS.map((pillar, index) => (
              <View
                key={index}
                style={[
                  styles.pillarItem,
                  index < PILLARS.length - 1 && styles.pillarItemBorder,
                ]}
              >
                <View style={styles.pillarIconContainer}>
                  <Text style={styles.pillarIcon}>{pillar.icon}</Text>
                </View>
                <Text style={styles.pillarText}>{pillar.text}</Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.bottomSection}>
          <PrimaryButton
            title="Let's begin"
            onPress={() => router.push('/(onboarding)/focus')}
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
    fontSize: 28,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subhead: {
    fontSize: 17,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    paddingVertical: spacing.sm,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  pillarItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(232, 164, 200, 0.15)',
  },
  pillarIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 164, 200, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarIcon: {
    fontSize: 24,
  },
  pillarText: {
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
