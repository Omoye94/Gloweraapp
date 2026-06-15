import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';

const CHALLENGES = [
  {
    id: 'wind-down',
    title: 'Evening Wind-Down',
    sub: '7 days of putting your phone away an hour before bed.',
    icon: '🌙',
    color: '#D8C9EC',
  },
  {
    id: 'gratitude',
    title: 'Gratitude Glow',
    sub: '14 days of one grateful note each day.',
    icon: '🫙',
    color: '#FBD4BF',
  },
  {
    id: 'morning-soft',
    title: 'Soft Morning Reset',
    sub: '5 days of starting your morning phone-free.',
    icon: '🌅',
    color: '#F2B4CC',
  },
];

export default function GentleChallengesScreen() {
  const router = useRouter();
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSaved((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(216,201,236,0.30)', 'rgba(242,180,204,0.10)']}
        style={styles.backdrop}
      />

      <View style={styles.main}>
        <Text style={styles.kicker}>PERSONAL CHALLENGES</Text>
        <Text style={styles.headline}>Take on challenges that keep you on track.</Text>
        <Text style={styles.subhead}>Pick one. Save others for later. No pressure.</Text>

        <View style={styles.list}>
          {CHALLENGES.map((c) => {
            const isSaved = saved.has(c.id);
            return (
              <Pressable
                key={c.id}
                onPress={() => toggle(c.id)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: c.color + '22' },
                  pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: c.color + '66' }]}>
                  <Text style={styles.icon}>{c.icon}</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{c.title}</Text>
                  <Text style={styles.cardSub}>{c.sub}</Text>
                </View>
                {isSaved ? (
                  <View style={styles.savedBadge}>
                    <Text style={styles.savedText}>SAVED</Text>
                  </View>
                ) : (
                  <Text style={styles.tapLabel}>tap to save</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/honestevening')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 500 },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 10, fontFamily: 'SpaceMono-Bold',
    color: 'rgba(216,201,236,0.85)', letterSpacing: 1.4, marginBottom: 14,
  },
  headline: {
    fontSize: 30, fontFamily: 'PlayfairDisplay', fontWeight: '600',
    color: '#FEFAF9', lineHeight: 38, marginBottom: 12, letterSpacing: -0.4,
  },
  subhead: {
    fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.62)',
    lineHeight: 22, marginBottom: 24,
  },
  list: { gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16, paddingHorizontal: 16, borderRadius: 22,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 22 },
  cardText: { flex: 1 },
  cardTitle: {
    fontFamily: 'PlayfairDisplay', fontSize: 17, color: '#FEFAF9',
    marginBottom: 3, letterSpacing: -0.2,
  },
  cardSub: {
    fontFamily: 'DMSans', fontSize: 12,
    color: 'rgba(255,255,255,0.60)', lineHeight: 17,
  },
  tapLabel: {
    fontFamily: 'DMSans', fontStyle: 'italic', fontSize: 10,
    color: 'rgba(255,255,255,0.42)', letterSpacing: 0.3,
  },
  savedBadge: {
    backgroundColor: '#C45A82', borderRadius: 999,
    paddingHorizontal: 9, paddingVertical: 4,
  },
  savedText: {
    fontFamily: 'SpaceMono-Bold', fontSize: 9,
    color: '#FFFFFF', letterSpacing: 1,
  },
  bottom: { paddingTop: 24 },
});
