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
      <View style={styles.cardRow}>
        <View style={[styles.cardEdge, { backgroundColor: categoryColor }]} />
        <View style={styles.card}>
          <Animated.View style={[styles.inner, { opacity }]}>
            <Text style={styles.eyebrow}>today's affirmation</Text>

            <Text style={styles.glyph}>❝</Text>

            <Text style={styles.quote}>{current.text}</Text>

            <View style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
              <Text style={[styles.categoryLabel, { color: categoryColor }]}>{current.category}</Text>
              <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
            </View>

            <Text style={styles.hint}>tap for another</Text>
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  cardRow: {
    flexDirection: 'row',
    borderRadius: 26,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.26,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
  },
  cardEdge: {
    width: 6,
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,
    borderWidth: 2,
    borderLeftWidth: 0,
    borderColor: 'rgba(58,46,43,0.18)',
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 26,
    overflow: 'hidden',
  },
  inner: {
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontStyle: 'italic',
    fontSize: 14,
    letterSpacing: 0.2,
    color: 'rgba(196,90,130,0.85)',
    marginBottom: 14,
  },
  glyph: {
    fontFamily: 'PlayfairDisplay',
    fontSize: 56,
    color: '#C45A82',
    opacity: 0.45,
    height: 36,
    lineHeight: 56,
    marginBottom: 8,
  },
  quote: {
    fontFamily: 'PlayfairDisplay-Italic',
    fontSize: 26,
    color: '#1A0A06',
    lineHeight: 36,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: 18,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  categoryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  categoryLabel: {
    fontFamily: 'SpaceMono-Bold',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  hint: {
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    fontSize: 11,
    color: 'rgba(58,46,43,0.5)',
    letterSpacing: 0.3,
  },
});
