import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

type Outcome = { emoji: string; text: string };

const RITUAL_OUTCOMES: Record<string, Outcome> = {
  'Drink water': {
    emoji: '🌱',
    text: '30 mornings of remembered hydration — without a streak to protect.',
  },
  'Move my body': {
    emoji: '🌿',
    text: 'A month of moving gently, even on the days you almost skipped.',
  },
  'Morning skincare': {
    emoji: '🌸',
    text: 'Your skin routine becomes the part of your morning you actually look forward to.',
  },
  'Take supplements': {
    emoji: '🌿',
    text: 'You stop wondering whether you took them — your garden remembers.',
  },
  'Reflect & journal': {
    emoji: '🌸',
    text: 'A month of reflections you can return to when life gets noisy.',
  },
  'Evening wind-down': {
    emoji: '🌙',
    text: '30 quieter nights closing the day on your own terms.',
  },
  'Mindful breathing': {
    emoji: '🌬',
    text: 'A breath you can come back to, again and again, when it gets loud.',
  },
  'Gratitude practice': {
    emoji: '✨',
    text: 'A month of small noticings that make the day feel softer.',
  },
};

function outcomeFor(ritual: string, index: number): Outcome {
  if (RITUAL_OUTCOMES[ritual]) return RITUAL_OUTCOMES[ritual];
  const fallbackEmoji = ['🌱', '🌿', '🌸'][index % 3];
  return {
    emoji: fallbackEmoji,
    text: `${ritual} becomes a quiet daily anchor.`,
  };
}

export default function VisionScreen() {
  const router = useRouter();
  const { selected_rituals, garden_name } = useOnboardingStore();
  const gardenName = garden_name || 'Your garden';
  const topRituals = selected_rituals.slice(0, 2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(242,180,204,0.22)', 'rgba(155,134,212,0.10)', 'rgba(20,12,32,0)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.label}>30 DAYS FROM NOW</Text>
        <Text style={styles.title}>Imagine your garden in full bloom</Text>
        <Text style={styles.subhead}>
          Here&apos;s what {gardenName} grows into when you tend it gently, even on messy days.
        </Text>

        <View style={styles.outcomeStack}>
          {topRituals.map((ritual, index) => {
            const outcome = outcomeFor(ritual, index);
            return (
              <View key={ritual} style={styles.outcomeCard}>
                <View style={styles.outcomeIconWrap}>
                  <Text style={styles.outcomeEmoji}>{outcome.emoji}</Text>
                </View>
                <View style={styles.outcomeBody}>
                  <Text style={styles.outcomeRitual}>{ritual}</Text>
                  <Text style={styles.outcomeText}>{outcome.text}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.closingStrip}>
          <Text style={styles.closingText}>
            Your garden remembers everything you tend.
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title="See who's tending with you"
          onPress={() => router.push('/(onboarding)/socialproof')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 520 },
  main: { flex: 1, paddingTop: 8 },
  label: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.62)',
    letterSpacing: 1.4,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay',
    fontWeight: '600',
    color: '#FEFAF9',
    lineHeight: 40,
    marginBottom: 14,
  },
  subhead: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.58)',
    lineHeight: 23,
    marginBottom: 28,
  },
  outcomeStack: { gap: 12, marginBottom: 22 },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(242,180,204,0.16)',
  },
  outcomeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(232,127,166,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(232,127,166,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outcomeEmoji: { fontSize: 22 },
  outcomeBody: { flex: 1 },
  outcomeRitual: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#FEFAF9',
    marginBottom: 4,
  },
  outcomeText: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay-Italic',
    color: 'rgba(255,255,255,0.66)',
    lineHeight: 21,
  },
  closingStrip: {
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(184,207,177,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(184,207,177,0.20)',
  },
  closingText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(255,255,255,0.58)',
    textAlign: 'center',
    lineHeight: 19,
  },
  bottom: { paddingTop: 24 },
});
