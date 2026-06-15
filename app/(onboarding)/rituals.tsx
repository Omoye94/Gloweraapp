import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { PrimaryButton, ChecklistItem } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const MAX_RITUALS = 5;

const RITUAL_OPTIONS = [
  { label: 'Drink water',       icon: '💧', time: 'MORNING' },
  { label: 'Move my body',      icon: '🏃‍♀️', time: 'MORNING' },
  { label: 'Morning skincare',  icon: '🌸', time: 'MORNING' },
  { label: 'Take supplements',  icon: '💊', time: 'MORNING' },
  { label: 'Reflect & journal', icon: '📝', time: 'EVENING' },
  { label: 'Evening wind-down', icon: '🌙', time: 'EVENING' },
  { label: 'Gratitude practice',icon: '✨', time: 'EVENING' },
  { label: 'Mindful breathing', icon: '🧘‍♀️', time: 'ANYTIME' },
];

export default function RitualsScreen() {
  const router = useRouter();
  const { selected_rituals, toggleRitual } = useOnboardingStore();

  const count = selected_rituals.length;
  const isMaxed = count >= MAX_RITUALS;
  const isValid = count >= 1;

  const counterText = isMaxed
    ? `${MAX_RITUALS} of ${MAX_RITUALS} — tap one to swap`
    : `${count} of ${MAX_RITUALS} selected`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.main}>
        <Text style={styles.label}>PLANT YOUR FIRST SEEDS</Text>
        <Text style={styles.headline}>Which seeds will you plant first?</Text>
        <Text style={styles.body}>Pick one to five. Each becomes a daily ritual.</Text>

        <View style={styles.quoteWrap}>
          <View style={styles.quoteRule} />
          <Text style={styles.quoteText}>
            Routines are rituals of devotion to yourself and your dreams.
          </Text>
        </View>

        <Text style={[styles.counter, isMaxed && styles.counterMaxed]}>{counterText}</Text>

        <View style={styles.list}>
          {RITUAL_OPTIONS.map((r) => {
            const isSelected = selected_rituals.includes(r.label);
            return (
              <ChecklistItem
                key={r.label}
                label={`${r.icon}  ${r.label}`}
                sublabel={r.time}
                checked={isSelected}
                disabled={isMaxed && !isSelected}
                onPress={() => toggleRitual(r.label)}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          title={`Plant my seeds${count > 0 ? ` (${count})` : ''}`}
          onPress={() => router.push('/(onboarding)/firstgrowth')}
          disabled={!isValid}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  label: { fontSize: 10, fontFamily: 'SpaceMono-Bold', color: 'rgba(242,180,204,0.6)', letterSpacing: 1.2, marginBottom: 12 },
  headline: { fontSize: 31, fontFamily: 'PlayfairDisplay', fontWeight: '600', color: '#FEFAF9', lineHeight: 38, marginBottom: 10 },
  body: { fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.50)', lineHeight: 22, marginBottom: 18 },
  quoteWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingRight: 12,
    marginBottom: 18,
  },
  quoteRule: {
    width: 2,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(242,180,204,0.45)',
    borderRadius: 1,
  },
  quoteText: {
    flex: 1,
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 16,
    color: 'rgba(255,247,243,0.82)',
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  counter: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.55)',
    letterSpacing: 1.1,
    marginBottom: 14,
  },
  counterMaxed: {
    color: 'rgba(242,180,204,0.85)',
  },
  list: { gap: 0 },
  bottom: { paddingTop: 24 },
});
