import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BeautyRitual } from '../../types/beauty';
import { BeautyCategoryPill, BEAUTY_CATEGORY_COLORS } from './BeautyCategoryPill';
import { BeautyCompletionGlow } from './BeautyCompletionGlow';
import { spacing, borderRadius, shadows } from '../../theme';

const COMPLETION_MESSAGES = [
  'A little care goes a long way.',
  'Your ritual is part of your glow.',
  'You showed up for yourself.',
];

interface BeautyRitualCardProps {
  ritual: BeautyRitual;
  isCompleted: boolean;
  onComplete: () => void;
  onUncomplete: () => void;
}

export const BeautyRitualCard: React.FC<BeautyRitualCardProps> = ({
  ritual,
  isCompleted,
  onComplete,
  onUncomplete,
}) => {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(isCompleted ? 1 : 0)).current;
  const [glowVisible, setGlowVisible] = useState(false);
  const [message, setMessage] = useState('');

  const handleComplete = () => {
    if (isCompleted) {
      onUncomplete();
      Animated.spring(checkScale, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Pick a rotation-based message
    const idx = Math.floor(Date.now() / 1000) % COMPLETION_MESSAGES.length;
    setMessage(COMPLETION_MESSAGES[idx]);
    setGlowVisible(true);
    setTimeout(() => setGlowVisible(false), 1200);

    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();

    Animated.spring(checkScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();

    onComplete();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/beauty/${ritual.id}` as any);
  };

  const dotColor = BEAUTY_CATEGORY_COLORS[ritual.category];

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={400}
        style={styles.card}
      >
        <BeautyCompletionGlow visible={glowVisible} />

        {/* Category dot */}
        <View style={[styles.categoryDot, { backgroundColor: dotColor }]} />

        {/* Content */}
        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {ritual.title}
          </Text>
          <BeautyCategoryPill category={ritual.category} />
          {ritual.notes ? (
            <Text style={styles.notes} numberOfLines={1}>
              {ritual.notes}
            </Text>
          ) : null}
          {isCompleted && message ? (
            <Text style={styles.completionMessage}>{message}</Text>
          ) : null}
        </View>

        {/* Completion circle */}
        <Pressable onPress={handleComplete} style={styles.checkButton} hitSlop={12}>
          <View style={[styles.checkOuter, isCompleted && styles.checkOuterFilled]}>
            <Animated.Text
              style={[styles.checkmark, { transform: [{ scale: checkScale }] }]}
            >
              ✓
            </Animated.Text>
          </View>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  card: {
    backgroundColor: '#FEFAF9',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,144,154,0.12)',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#3A2E2B',
    lineHeight: 20,
  },
  titleCompleted: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  notes: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#9E8880',
    marginTop: 2,
  },
  completionMessage: {
    fontSize: 11,
    fontFamily: 'PlayfairDisplay-Italic',
    color: '#C45A82',
    marginTop: 2,
  },
  checkButton: {
    padding: 4,
  },
  checkOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(212,144,154,0.4)',
    backgroundColor: 'rgba(254,250,249,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOuterFilled: {
    backgroundColor: '#C45A82',
    borderColor: '#C45A82',
  },
  checkmark: {
    fontSize: 14,
    color: '#FEFAF9',
    fontWeight: '700',
  },
});
