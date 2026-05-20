import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useHabitStore, usePlantStore } from '../../stores';
import { formatDateKey } from '../../utils/dateUtils';
import { spacing, shadows } from '../../theme/spacing';
import { SolarIcon } from '../ui/SolarIcon';

const PREVIEW_LIMIT = 4;

export function TodayHabitsCard() {
  const router = useRouter();
  const habits = useHabitStore(s => s.habits);
  const dailySummaries = useHabitStore(s => s.dailySummaries);
  const activeHabits = useMemo(
    () => habits.filter(h => h.isActive).sort((a, b) => a.order - b.order),
    [habits],
  );
  const getCompletionForDate = useHabitStore(s => s.getCompletionForDate);
  const completeHabit = useHabitStore(s => s.completeHabit);
  const uncompleteHabit = useHabitStore(s => s.uncompleteHabit);
  const getProgressForDate = useHabitStore(s => s.getProgressForDate);
  const currentStreak = usePlantStore(s => s.plant.streak.currentStreak);
  const addPoints = usePlantStore(s => s.addPoints);
  const recordDailyActivity = usePlantStore(s => s.recordDailyActivity);

  const dateKey = formatDateKey();
  const progress = getProgressForDate(dateKey);
  const preview = activeHabits.slice(0, PREVIEW_LIMIT);
  const hasMore = activeHabits.length > PREVIEW_LIMIT;

  const handleToggle = (habitId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const completion = getCompletionForDate(habitId, dateKey);
    if (completion) {
      uncompleteHabit(habitId);
    } else {
      recordDailyActivity();
      const pts = completeHabit(habitId, 'full');
      if (pts > 0) addPoints(pts, true);
    }
  };

  if (activeHabits.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.eyebrow}>RITUALS TODAY</Text>
        <View style={styles.header}>
          <Text style={styles.title}>Today's habits</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/habits')}
          style={({ pressed }) => [styles.emptyState, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.emptyTitle}>No habits yet</Text>
          <View style={styles.emptyCta}>
            <Text style={styles.emptySubtext}>Add your first ritual</Text>
            <SolarIcon name="alt-arrow-right-linear" size={13} color="#E87FA6" />
          </View>
        </Pressable>
      </View>
    );
  }

  const pct = progress.total > 0 ? progress.completed / progress.total : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>RITUALS TODAY</Text>
      <View style={styles.header}>
        <Text style={styles.title}>Today's habits</Text>
        <Text style={styles.counter}>
          {progress.completed}/{progress.total}
        </Text>
      </View>

      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${pct * 100}%` }]} />
      </View>

      <View style={styles.list}>
        {preview.map((habit) => {
          const completion = getCompletionForDate(habit.id, dateKey);
          const done = !!completion;
          return (
            <Pressable
              key={habit.id}
              onPress={() => handleToggle(habit.id)}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
            >
              <View style={[styles.checkbox, done && styles.checkboxDone]}>
                {done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <Text style={[styles.habitName, done && styles.habitNameDone]} numberOfLines={1}>
                {habit.name}
              </Text>
              {currentStreak > 0 && (
                <View style={styles.streakChip}>
                  <Text style={styles.streakChipText}>🔥{currentStreak}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/habits')}
        style={({ pressed }) => [styles.viewAllButton, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.viewAllText}>
          {hasMore ? 'See all habits' : 'Manage habits'}
        </Text>
        <SolarIcon name="alt-arrow-right-linear" size={13} color="#E87FA6" />
      </Pressable>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -0.3,
  },
  counter: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    color: '#C45A82',
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(242,180,204,0.3)',
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E87FA6',
    borderRadius: 2,
  },
  list: { gap: 14, marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EADBD4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#8FA886',
    borderColor: '#8FA886',
  },
  checkmark: {
    color: '#FFFAF8',
    fontSize: 13,
    fontWeight: '700',
  },
  habitIcon: {
    fontSize: 18,
  },
  habitName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
  },
  habitNameDone: {
    color: '#9E8880',
    textDecorationLine: 'line-through',
  },
  streakChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(242,180,204,0.22)',
  },
  streakChipText: {
    fontSize: 12,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#C45A82',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(242,180,204,0.5)',
    borderRadius: 12,
    paddingVertical: 14,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#E87FA6',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    marginBottom: 4,
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#E87FA6',
  },
});
