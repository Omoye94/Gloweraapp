import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { shadows, spacing } from '../../theme/spacing';
import { Mood } from '../../types/journal';
import { useJournalStore } from '../../stores';
import { formatDateKey } from '../../utils/dateUtils';

const MOOD_OPTIONS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: 'low',        emoji: '🌙', label: 'Tired' },
  { mood: 'struggling', emoji: '🌧️', label: 'Heavy' },
  { mood: 'neutral',    emoji: '☁️', label: 'Okay' },
  { mood: 'calm',       emoji: '🌤️', label: 'Warm' },
  { mood: 'radiant',    emoji: '✨', label: 'Glowing' },
];

// Drop Lottie JSON files into assets/mood-lottie/ and replace nulls with require(...) calls.
// Until then, the card falls back to the emoji character.
const MOOD_LOTTIE: Record<Mood, number | null> = {
  low: null,        // require('../../../assets/mood-lottie/moon.json')
  struggling: require('../../../assets/mood-lottie/sad-face.json'),
  neutral: null,    // require('../../../assets/mood-lottie/cloud.json')
  calm: null,       // require('../../../assets/mood-lottie/sun-cloud.json')
  radiant: null,    // require('../../../assets/mood-lottie/sparkle.json')
};

export function MoodCheckInCard() {
  const router = useRouter();
  const today = formatDateKey();
  const selected = useJournalStore(s => s.moodByDate[today]);
  const setMoodForDate = useJournalStore(s => s.setMoodForDate);

  const handleSelect = (mood: Mood) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMoodForDate(today, mood);
    router.push({
      pathname: '/(tabs)/journal',
      params: { mood, compose: String(Date.now()) },
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>TODAY'S MOOD</Text>
      <Text style={styles.question}>How are you feeling?</Text>
      <View style={styles.row}>
        {MOOD_OPTIONS.map(({ mood, emoji, label }) => (
          <Pressable
            key={mood}
            onPress={() => handleSelect(mood)}
            style={({ pressed }) => [
              styles.moodItem,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={[styles.emojiWrap, selected === mood && styles.emojiWrapSelected]}>
              {MOOD_LOTTIE[mood] ? (
                <LottieView
                  source={MOOD_LOTTIE[mood] as any}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              ) : (
                <Text style={styles.emoji}>{emoji}</Text>
              )}
            </View>
            <Text style={[styles.label, selected === mood && styles.labelSelected]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFAF8',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  question: {
    fontSize: 20,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -0.3,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  emojiWrapSelected: {
    backgroundColor: 'rgba(232,127,166,0.18)',
  },
  emoji: { fontSize: 28 },
  lottie: { width: 44, height: 44 },
  label: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#9E8880',
  },
  labelSelected: {
    color: '#C45A82',
    fontFamily: 'DMSans',
    fontWeight: '600',
  },
});
