import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

function getGlowType(focusAreas: string[]) {
  if (focusAreas.some(area => /supplement|hydration|skin/i.test(area))) {
    return {
      name: 'Glow Organizer',
      line: 'Your scattered glow habits become seeds in one garden you can tend.',
    };
  }

  if (focusAreas.some(area => /movement|sleep|rest/i.test(area))) {
    return {
      name: 'Consistency Reset',
      line: 'Your garden is built for getting back into rhythm without starting from zero.',
    };
  }

  return {
    name: 'Soft Accountability',
    line: 'Your garden gives your glow-up structure while keeping the pressure low.',
  };
}

export default function ResultsScreen() {
  const router = useRouter();
  const { focus_areas, selected_rituals, garden_name, first_reflection } = useOnboardingStore();
  const glowType = getGlowType(focus_areas);
  const gardenName = garden_name || 'My Glow Garden';
  const topRituals = selected_rituals.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(242,180,204,0.20)', 'rgba(155,134,212,0.10)', 'rgba(20,12,32,0)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.label}>YOUR GLOW TYPE</Text>
        <View style={styles.revealCard}>
          <Text style={styles.revealEyebrow}>You are a</Text>
          <Text style={styles.revealTitle}>{glowType.name}</Text>
          <Text style={styles.revealLine}>{glowType.line}</Text>
        </View>

        <View style={styles.planBlock}>
          <Text style={styles.blockLabel}>YOUR GLOW GARDEN</Text>
          <Text style={styles.gardenName}>{gardenName}</Text>
          <Text style={styles.planText}>
            Start with {selected_rituals.length || 1} seed{selected_rituals.length === 1 ? '' : 's'}.
            Every time you tend a glow habit, your garden becomes visible proof that you are taking care of yourself.
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
            Your glow-up stops feeling scattered when you can watch it grow.
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title="Enter my glow garden"
          onPress={() => router.push('/(onboarding)/paywall')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 520 },
  main: { flex: 1, paddingTop: 8 },
  label: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.62)',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  revealCard: {
    minHeight: 214,
    borderRadius: 28,
    padding: 24,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(242,180,204,0.24)',
    marginBottom: 18,
  },
  revealEyebrow: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(242,180,204,0.76)',
    marginBottom: 4,
  },
  revealTitle: {
    fontSize: 38,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 45,
    marginBottom: 12,
  },
  revealLine: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 23,
  },
  planBlock: {
    paddingVertical: 6,
    marginBottom: 14,
  },
  blockLabel: {
    fontSize: 9,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.50)',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  gardenName: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    marginBottom: 8,
  },
  planText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.52)',
    lineHeight: 23,
  },
  ritualStack: { gap: 8, marginBottom: 16 },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  ritualNumber: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.55)',
    width: 22,
  },
  ritualText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.72)',
  },
  intentionCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: 'rgba(232,127,166,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232,127,166,0.18)',
    marginBottom: 16,
  },
  intentionText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(255,255,255,0.68)',
    lineHeight: 24,
  },
  proofStrip: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(184,207,177,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(184,207,177,0.20)',
  },
  proofText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.58)',
    textAlign: 'center',
    lineHeight: 19,
  },
  bottom: { paddingTop: 24 },
});
