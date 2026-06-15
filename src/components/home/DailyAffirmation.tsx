import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import {
  AFFIRMATIONS,
  AFFIRMATION_CATEGORY_COLORS,
  getDailyAffirmation,
  getAffirmationIndex,
  getNextAffirmation,
  type Affirmation,
} from '../../constants/affirmations';

export function DailyAffirmation() {
  const initial = getDailyAffirmation();
  const [current, setCurrent] = useState<Affirmation>(initial);
  const [currentIndex, setCurrentIndex] = useState(() => getAffirmationIndex(initial));
  const opacity = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);

  const handlePress = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    Animated.timing(opacity, {
      toValue: 0, duration: 180, useNativeDriver: true,
    }).start(() => {
      const next = getNextAffirmation(currentIndex);
      setCurrent(next);
      setCurrentIndex((currentIndex + 1) % AFFIRMATIONS.length);

      Animated.timing(opacity, {
        toValue: 1, duration: 320, useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
      });
    });
  };

  const categoryColor = AFFIRMATION_CATEGORY_COLORS[current.category];

  return (
    <Pressable onPress={handlePress} style={styles.wrap}>
      <View style={styles.card}>
        <View style={[styles.topAccent, { backgroundColor: categoryColor }]} />
        <Animated.View style={[styles.inner, { opacity }]}>
          <Text style={styles.eyebrow}>AFFIRMATION OF THE DAY</Text>

          <Text style={styles.glyph}>❝</Text>

          <Text style={styles.quote}>{current.text}</Text>

          <View style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
            <Text style={styles.categoryLabel}>{current.category}</Text>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          </View>

          <Text style={styles.hint}>tap for another</Text>
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FCF1EB',
    borderRadius: 24,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowColor: '#3A1A10',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: '42%',
    right: '42%',
    height: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
  inner: {
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.6,
    color: '#A89A93',
    marginBottom: 12,
  },
  glyph: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 44,
    color: '#C45A82',
    opacity: 0.32,
    height: 28,
    lineHeight: 44,
    marginBottom: 6,
  },
  quote: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 19,
    color: '#3A2E2B',
    lineHeight: 28,
    letterSpacing: -0.2,
    textAlign: 'center',
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  categoryLabel: {
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    fontSize: 11,
    color: '#8C7670',
    letterSpacing: 0.6,
  },
  hint: {
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    fontSize: 11,
    color: '#B8A9A4',
    letterSpacing: 0.3,
  },
});
