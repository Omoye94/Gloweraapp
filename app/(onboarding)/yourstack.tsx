import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';
import { useOnboardingStore } from '../../src/stores/onboardingStore';

const SUPP_FALLBACKS = [
  { name: 'Magnesium', icon: '✨', color: '#D8C9EC' },
  { name: 'Vitamin D', icon: '☀️', color: '#FBD4BF' },
  { name: 'Omega-3',   icon: '🐟', color: '#B8CFB1' },
];

const SUPP_META: Record<string, { icon: string; color: string }> = {
  'Multivitamin': { icon: '💊', color: '#F2B4CC' },
  'Vitamin D':    { icon: '☀️', color: '#FBD4BF' },
  'Magnesium':    { icon: '✨', color: '#D8C9EC' },
  'Iron':         { icon: '🔴', color: '#F4A888' },
  'Probiotic':    { icon: '🦠', color: '#B8CFB1' },
  'Omega-3':      { icon: '🐟', color: '#B8CFB1' },
};

export default function YourStackScreen() {
  const router = useRouter();
  const { selected_supplements } = useOnboardingStore();
  const [done, setDone] = useState<Set<string>>(new Set());

  const supps = (selected_supplements.length > 0
    ? selected_supplements.slice(0, 3).map((name) => ({
        name,
        icon: SUPP_META[name]?.icon ?? '💊',
        color: SUPP_META[name]?.color ?? '#F2B4CC',
      }))
    : SUPP_FALLBACKS);

  const toggle = (name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDone((s) => {
      const next = new Set(s);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <OnboardingScreen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.main}>
        <Text style={styles.kicker}>DAILY SUPPLEMENTS</Text>
        <Text style={styles.headline}>Track your supplements, every day.</Text>
        <Text style={styles.subhead}>Tap one to check it off. Stay on top of your health.</Text>

        <View style={styles.mockupCard}>
          <View style={styles.mockHeader}>
            <Text style={styles.mockTitle}>Today's Supplements</Text>
            <View style={styles.mockStreakChip}>
              <View style={styles.mockStreakDot} />
              <Text style={styles.mockStreakText}>Day 3</Text>
            </View>
          </View>

          {supps.map((s) => {
            const isDone = done.has(s.name);
            return (
              <Pressable
                key={s.name}
                onPress={() => toggle(s.name)}
                style={[styles.mockRow, isDone && styles.mockRowDone]}
              >
                <View style={[styles.mockIconCircle, { backgroundColor: s.color + '55' }]}>
                  <Text style={styles.mockIcon}>{s.icon}</Text>
                </View>
                <Text style={[styles.mockRowName, isDone && styles.mockRowNameDone]}>{s.name}</Text>
                <View style={[styles.mockCheck, isDone && styles.mockCheckFilled]}>
                  {isDone && <Text style={styles.mockCheckmark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}

          <Text style={styles.mockFooter}>
            {done.size === 0
              ? 'tap a pill to mark it done'
              : done.size === supps.length
                ? 'all done ✦'
                : `${done.size} of ${supps.length} done`}
          </Text>
        </View>
      </View>

        <View style={styles.bottom}>
          <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/honestevening')} />
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 11, fontFamily: 'SpaceMono-Bold',
    color: '#C45A82', letterSpacing: 1.6, marginBottom: 14,
  },
  headline: {
    fontSize: 32, fontFamily: 'PlayfairDisplay', fontWeight: '600',
    color: '#3A2E2B', lineHeight: 40, marginBottom: 12, letterSpacing: -0.3,
  },
  subhead: {
    fontSize: 16, fontFamily: 'DMSans', color: 'rgba(58,46,43,0.75)',
    lineHeight: 24, marginBottom: 24,
  },
  mockupCard: {
    backgroundColor: '#FFFFFF', borderRadius: 28,
    paddingVertical: 22, paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: 'rgba(58,46,43,0.12)',
    shadowColor: '#3A2E2B', shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22, shadowRadius: 30, elevation: 9,
  },
  mockHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  mockTitle: {
    fontFamily: 'PlayfairDisplay', fontSize: 18, color: '#3A2E2B', letterSpacing: -0.2,
  },
  mockStreakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(196,90,130,0.10)',
    borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4,
  },
  mockStreakDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#C45A82' },
  mockStreakText: {
    fontFamily: 'SpaceMono-Bold', fontSize: 9, color: '#C45A82', letterSpacing: 1,
  },
  mockRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,246,242,0.75)', borderRadius: 18, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(58,46,43,0.07)',
  },
  mockRowDone: { opacity: 0.5 },
  mockIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  mockIcon: { fontSize: 17 },
  mockRowName: { fontFamily: 'PlayfairDisplay', fontSize: 15, color: '#3A2E2B', flex: 1 },
  mockRowNameDone: { color: '#A89A93' },
  mockCheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: '#C9BDB6',
    alignItems: 'center', justifyContent: 'center',
  },
  mockCheckFilled: { backgroundColor: '#9CBFA0', borderColor: '#9CBFA0' },
  mockCheckmark: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  mockFooter: {
    fontFamily: 'DMSans', fontStyle: 'italic', fontSize: 11,
    color: '#A89A93', letterSpacing: 0.3, textAlign: 'center',
    marginTop: 6,
  },
  bottom: { paddingTop: 24 },
});
