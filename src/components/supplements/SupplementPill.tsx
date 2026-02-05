import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Habit, HabitCompletion } from '../../types/habit';
import { theme, spacing, borderRadius } from '../../theme';

interface SupplementPillProps {
  habit: Habit;
  completion: HabitCompletion | undefined;
  onPress: () => void;
  onLongPress: () => void;
}

export function SupplementPill({ habit, completion, onPress, onLongPress }: SupplementPillProps) {
  const isTaken = !!completion;
  const initial = habit.name.charAt(0).toUpperCase();
  const dosage = habit.supplementMeta?.dosage;

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.pill,
          isTaken ? styles.pillTaken : styles.pillUntaken,
          pressed && styles.pillPressed,
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        {isTaken ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <Text style={styles.initial}>{initial}</Text>
        )}
      </Pressable>
      <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
      {dosage && (
        <Text style={styles.dosage} numberOfLines={1}>{dosage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 56,
  },
  pill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillUntaken: {
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.accent,
  },
  pillTaken: {
    backgroundColor: theme.accent,
  },
  pillPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  initial: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.surface,
  },
  name: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 56,
  },
  dosage: {
    fontSize: 9,
    color: theme.textMuted,
    textAlign: 'center',
    maxWidth: 56,
  },
});
