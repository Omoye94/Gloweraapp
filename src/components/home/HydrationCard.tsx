import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useHydrationStore } from '../../stores';
import { spacing, shadows } from '../../theme/spacing';

export function HydrationCard() {
  const glasses = useHydrationStore(s => s.getTodayGlasses());
  const goal = useHydrationStore(s => s.dailyGoal);
  const addGlass = useHydrationStore(s => s.addGlass);
  const removeGlass = useHydrationStore(s => s.removeGlass);

  const handleTapSlot = (index: number) => {
    const currentCount = glasses;
    if (index < currentCount) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      removeGlass();
    } else if (index === currentCount) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addGlass();
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>HYDRATION</Text>
      <View style={styles.header}>
        <Text style={styles.title}>Today's water</Text>
        <Text style={styles.counter}>
          {glasses}/{goal} glasses
        </Text>
      </View>

      <View style={styles.slotsRow}>
        {Array.from({ length: goal }).map((_, i) => {
          const filled = i < glasses;
          return (
            <Pressable
              key={i}
              onPress={() => handleTapSlot(i)}
              style={({ pressed }) => [
                styles.slot,
                filled ? styles.slotFilled : styles.slotEmpty,
                pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
              ]}
            >
              <Text style={[styles.slotEmoji, !filled && styles.slotEmojiMuted]}>💧</Text>
            </Pressable>
          );
        })}
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
    color: '#6FA8A3',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -0.3,
  },
  counter: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#6FA8A3',
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  slot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: {
    backgroundColor: 'rgba(111,168,163,0.28)',
  },
  slotEmpty: {
    backgroundColor: 'rgba(184,200,217,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(184,200,217,0.4)',
  },
  slotEmoji: {
    fontSize: 20,
  },
  slotEmojiMuted: {
    opacity: 0.25,
  },
});
