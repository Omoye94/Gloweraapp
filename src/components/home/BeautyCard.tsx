import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SolarIcon } from '../ui/SolarIcon';
import { useBeautyStore } from '../../stores/useBeautyStore';
import { formatDateKey } from '../../utils/dateUtils';
import { spacing, shadows } from '../../theme';

export const BeautyCard: React.FC = () => {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;

  const getActiveRituals = useBeautyStore((s) => s.getActiveRituals);
  const isCompletedOnDate = useBeautyStore((s) => s.isCompletedOnDate);

  const activeRituals = getActiveRituals();

  // Always show the card so users can discover and add their first ritual

  const today = formatDateKey(new Date());
  const dueToday = activeRituals.filter((r) => {
    if (r.frequency === 'weekly' || r.time_of_day === 'weekly') return false;
    return !isCompletedOnDate(r.id, today);
  });

  const subtitle =
    activeRituals.length === 0
      ? 'Small rituals that help you feel cared for.'
      : dueToday.length === 0
      ? 'All rituals complete ✨'
      : dueToday.length === 1
      ? '1 ritual remaining for today'
      : `${dueToday.length} rituals remaining for today`;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start(() => {
      router.push('/(tabs)/beauty');
    });
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={handlePress} style={[styles.pressable, styles.card]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🌸</Text>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Beauty rituals</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>Open rituals</Text>
          <SolarIcon name="alt-arrow-right-linear" size={13} color="#E87FA6" />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 22,
    ...shadows.sm,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pressable: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFAF8',
    padding: 20,
    gap: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(242,180,204,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  textBlock: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: 'rgba(42,28,30,0.6)',
    lineHeight: 19,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ctaText: {
    fontSize: 13,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#E87FA6',
    letterSpacing: 0.3,
  },
});
