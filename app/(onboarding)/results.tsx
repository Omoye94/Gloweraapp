import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

function getGlowType(focusAreas: string[]) {
  const primary = focusAreas[0] || '';

  if (/supplement|hydration|skin/i.test(primary)) {
    return {
      name: 'The Tender',
      line: 'You bring the small, steady care that holds everything together.',
    };
  }

  if (/movement|sleep|rest/i.test(primary)) {
    return {
      name: 'The Wildflower',
      line: 'You return to yourself, no matter how the week goes.',
    };
  }

  return {
    name: 'The Gentle Builder',
    line: 'You build with care, not pressure.',
  };
}

export default function ResultsScreen() {
  const router = useRouter();
  const { focus_areas, selected_rituals, garden_name, first_reflection } = useOnboardingStore();
  const glowType = getGlowType(focus_areas);
  const gardenName = garden_name || 'My Glow Garden';
  const topRituals = selected_rituals.slice(0, 3);

  return (
    <OnboardingScreen tone="transformation">
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.main}>
        <Text style={styles.label}>YOUR GLOW TYPE</Text>
        <View style={styles.revealCard}>
          <Text style={styles.revealEyebrow}>You&apos;re a</Text>
          <Text style={styles.revealTitle}>{glowType.name}</Text>
          <Text style={styles.revealLine}>{glowType.line}</Text>
        </View>

        <View style={styles.planBlock}>
          <Text style={styles.blockLabel}>YOUR GLOW GARDEN</Text>
          <Text style={styles.gardenName}>{gardenName}</Text>
          <Text style={styles.planText}>
            Start with {selected_rituals.length || 1} seed{selected_rituals.length === 1 ? '' : 's'}.
            Every time you tend one, your garden becomes visible proof that you&apos;re taking care of yourself.
          </Text>
        </View>

        {topRituals.length > 0 && (
          <View style={styles.ritualStack}>
            {topRituals.map((ritual, index) => (
              <View key={ritual} style={styles.ritualRow}>
                <Text style={styles.ritualNumber}>0{index + 1}</Text>
                <Text style={styles.ritualText}>{ritual}</Text>
              </View>
            ))}
          </View>
        )}

        {first_reflection ? (
          <View style={styles.intentionCard}>
            <Text style={styles.blockLabel}>YOUR INTENTION</Text>
            <Text style={styles.intentionText} numberOfLines={3}>{first_reflection}</Text>
          </View>
        ) : null}

        <View style={styles.proofStrip}>
          <Text style={styles.proofText}>
            Growth you can actually see.
          </Text>
        </View>
      </View>

        <View style={styles.bottom}>
          <PrimaryButton
            title="Enter my glow garden"
            onPress={() => router.push('/(onboarding)/firstgrowth')}
          />
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  label: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.6,
    marginBottom: 14,
  },
  revealCard: {
    minHeight: 224,
    borderRadius: 28,
    padding: 28,
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#C45A82',
    borderLeftWidth: 6,
    borderLeftColor: '#C45A82',
    marginBottom: 18,
    shadowColor: '#C45A82',
    shadowOpacity: 0.42,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  revealEyebrow: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#C45A82',
    marginBottom: 4,
  },
  revealTitle: {
    fontSize: 38,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 45,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  revealLine: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.75)',
    lineHeight: 23,
  },
  planBlock: {
    paddingVertical: 6,
    marginBottom: 14,
  },
  blockLabel: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  gardenName: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: -0.4,
    marginBottom: 8,
  },
  planText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(58,46,43,0.72)',
    lineHeight: 23,
  },
  ritualStack: { gap: 10, marginBottom: 16 },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(58,46,43,0.14)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  ritualNumber: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    width: 22,
    letterSpacing: 0.8,
  },
  ritualText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
  },
  intentionCard: {
    borderRadius: 22,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(196,90,130,0.3)',
    marginBottom: 16,
    shadowColor: '#C45A82',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  intentionText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(58,46,43,0.78)',
    lineHeight: 24,
  },
  proofStrip: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(143,168,134,0.55)',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  proofText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: '#3A2E2B',
    textAlign: 'center',
    lineHeight: 19,
  },
  bottom: { paddingTop: 24 },
});
