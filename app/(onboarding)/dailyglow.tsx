import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { OnboardingScreen, PrimaryButton } from '../../src/components/onboarding';

const SAMPLE = [
  { text: 'I tend to myself the way I tend to what I love.', category: 'glow', dot: '#F2B4CC' },
  { text: 'Every small act of care is a seed I am planting.', category: 'growth', dot: '#9B86D4' },
  { text: 'I am here. This breath is enough.', category: 'mindfulness', dot: '#8FA886' },
  { text: 'My softness is not weakness — it is strength.', category: 'strength', dot: '#C45A82' },
];

function formatToday(): string {
  const d = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  return `A THOUGHT FOR ${d.toUpperCase()}`;
}

export default function DailyGlowScreen() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);

  const handleShift = () => {
    if (busy.current) return;
    busy.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setIdx((i) => (i + 1) % SAMPLE.length);
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }).start(() => {
        busy.current = false;
      });
    });
  };

  const cur = SAMPLE[idx];

  return (
    <OnboardingScreen>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.main}>
        <Text style={styles.kicker}>DAILY AFFIRMATION</Text>
        <Text style={styles.headline}>A new affirmation every day.</Text>
        <Text style={styles.subhead}>Tap to read another. Always free, always for you.</Text>

        <Pressable onPress={handleShift} style={styles.mockupCard}>
          <Animated.View style={{ alignItems: 'center', opacity }}>
            <Text style={styles.mockEyebrow}>{formatToday()}</Text>
            <Text style={styles.mockGlyph}>❝</Text>
            <Text style={styles.mockQuote}>{cur.text}</Text>
            <View style={styles.mockCatRow}>
              <View style={[styles.mockDot, { backgroundColor: cur.dot }]} />
              <Text style={styles.mockCatLabel}>{cur.category}</Text>
              <View style={[styles.mockDot, { backgroundColor: cur.dot }]} />
            </View>
            <Text style={styles.mockHint}>tap for another</Text>
          </Animated.View>
        </Pressable>
      </View>

        <View style={styles.bottom}>
          <PrimaryButton title="Continue" onPress={() => router.push('/(onboarding)/yourstack')} />
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
    lineHeight: 24, marginBottom: 32,
  },
  mockupCard: {
    backgroundColor: '#FFFFFF', borderRadius: 28,
    paddingVertical: 32, paddingHorizontal: 24,
    borderWidth: 1.5, borderColor: 'rgba(58,46,43,0.12)',
    shadowColor: '#3A2E2B', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.24, shadowRadius: 32, elevation: 10,
  },
  mockEyebrow: {
    fontFamily: 'SpaceMono-Bold', fontSize: 10,
    letterSpacing: 1.6, color: '#A89A93', marginBottom: 14,
  },
  mockGlyph: {
    fontFamily: 'PlayfairDisplay', fontSize: 46,
    color: '#C45A82', opacity: 0.38, height: 30, lineHeight: 46, marginBottom: 8,
  },
  mockQuote: {
    fontFamily: 'PlayfairDisplay-Italic', fontSize: 19,
    color: '#3A2E2B', lineHeight: 28, letterSpacing: -0.2,
    textAlign: 'center', marginBottom: 16,
  },
  mockCatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  mockDot: { width: 3, height: 3, borderRadius: 1.5 },
  mockCatLabel: {
    fontFamily: 'DMSans', fontStyle: 'italic', fontSize: 11,
    color: '#8C7670', letterSpacing: 0.6,
  },
  mockHint: {
    fontFamily: 'DMSans', fontStyle: 'italic', fontSize: 11,
    color: '#B8A9A4', letterSpacing: 0.3,
  },
  bottom: { paddingTop: 24 },
});
