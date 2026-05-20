import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Sparkles } from 'lucide-react-native';
let Speech: typeof import('expo-speech') | null = null;
try {
  Speech = require('expo-speech');
} catch {
  // Native module not available in current build
}
import { spacing, shadows, borderRadius } from '../../theme/spacing';
import {
  AFFIRMATIONS,
  AFFIRMATION_CATEGORY_COLORS,
  getDailyAffirmation,
  getAffirmationIndex,
  getNextAffirmation,
  type Affirmation,
} from '../../constants/affirmations';

export function AffirmationCard() {
  const initial = getDailyAffirmation();
  const [current, setCurrent] = useState<Affirmation>(initial);
  const [currentIndex, setCurrentIndex] = useState(() => getAffirmationIndex(initial));
  const isAnimating = useRef(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (!Speech) {
      // expo-speech not yet linked — needs `npx expo run:ios` to rebuild
      return;
    }
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    Speech.speak(current.text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.88,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handlePress = () => {
    Speech?.stop();
    setIsSpeaking(false);
    if (isAnimating.current) return;
    isAnimating.current = true;

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }),
    ]).start(() => {
      const next = getNextAffirmation(currentIndex);
      const nextIndex = (currentIndex + 1) % AFFIRMATIONS.length;
      setCurrent(next);
      setCurrentIndex(nextIndex);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start(() => {
        isAnimating.current = false;
      });
    });
  };

  const categoryColor = AFFIRMATION_CATEGORY_COLORS[current.category];
  const categoryLabel = current.category.toUpperCase();

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <Animated.View style={[styles.inner, { opacity, transform: [{ scale }] }]}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionLabel}>DAILY AFFIRMATION</Text>
          <View style={[styles.categoryPill, { backgroundColor: categoryColor + '26' }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryLabel}</Text>
          </View>
        </View>

        <Text style={styles.quote}>"{current.text}"</Text>

        <View style={styles.hintRow}>
          <View style={styles.hintLeft}>
            <Sparkles size={11} color="#9E8880" strokeWidth={1.5} />
            <Text style={styles.hint}>tap to shift</Text>
          </View>
          <Pressable
            onPress={handleSpeak}
            hitSlop={12}
            style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
          >
            <Text style={styles.speakIcon}>{isSpeaking ? '◼ ' : '🔊 '}</Text>
            <Text style={[styles.speakLabel, isSpeaking && styles.speakLabelActive]}>
              {isSpeaking ? 'Stop' : 'Listen'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEFAF9',
    borderRadius: borderRadius.hero,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  inner: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#6B5B52',
    letterSpacing: 0.8,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'SpaceMono-Bold',
    letterSpacing: 0.5,
  },
  quote: {
    fontSize: 17,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#3A2E2B',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 16,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#9E8880',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(212,144,154,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,144,154,0.25)',
  },
  speakButtonActive: {
    backgroundColor: 'rgba(212,144,154,0.28)',
    borderColor: '#C45A82',
  },
  speakIcon: {
    fontSize: 12,
  },
  speakLabel: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#C45A82',
  },
  speakLabelActive: {
    color: '#B87080',
  },
});
