import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PrimaryButton } from '../../src/components/onboarding';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(242,180,204,0.30)', 'rgba(216,201,236,0.10)']}
        style={styles.backdrop}
      />

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, justifyContent: 'space-between' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, height: 500 },
  main: { flex: 1, paddingTop: 8 },
  kicker: {
    fontSize: 10, fontFamily: 'SpaceMono-Bold',
    color: 'rgba(242,180,204,0.62)', letterSpacing: 1.4, marginBottom: 14,
  },
  headline: {
    fontSize: 30, fontFamily: 'PlayfairDisplay', fontWeight: '600',
    color: '#FEFAF9', lineHeight: 38, marginBottom: 12, letterSpacing: -0.4,
  },
  subhead: {
    fontSize: 15, fontFamily: 'DMSans', color: 'rgba(255,255,255,0.62)',
    lineHeight: 22, marginBottom: 32,
  },
  mockupCard: {
    backgroundColor: '#FFF7F2', borderRadius: 28,
    paddingVertical: 28, paddingHorizontal: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.30, shadowRadius: 28,
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
