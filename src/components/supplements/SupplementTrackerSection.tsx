import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useHabitStore, usePlantStore } from '../../stores';
import { Habit, CompletionType } from '../../types/habit';
import { theme, spacing, borderRadius, shadows } from '../../theme';
import { formatDateKey, getCurrentWeekDates } from '../../utils/dateUtils';
import { SupplementPill } from './SupplementPill';
import { WeeklyConsistencyView } from './WeeklyConsistencyView';

interface SupplementTrackerSectionProps {
  onMessage?: (message: string) => void;
  onOpenLibrary?: () => void;
}

const TAKEN_MESSAGES = [
  "Nourishing your body, one pill at a time",
  "Your body thanks you",
  "Supplements taken, glow activated",
  "Consistency is self-love",
  "Another step toward radiance",
];

const ALL_TAKEN_MESSAGES = [
  "All supplements taken! You're glowing",
  "Full supplement routine complete!",
  "Every vitamin accounted for!",
  "Your body is getting everything it needs",
];

export function SupplementTrackerSection({ onMessage, onOpenLibrary }: SupplementTrackerSectionProps) {
  const {
    habits,
    getActiveHabits,
    completeHabit,
    uncompleteHabit,
    getCompletionForToday,
    dailySummaries,
  } = useHabitStore();
  const { addPoints, recordDailyActivity } = usePlantStore();

  const supplementHabits = getActiveHabits().filter(h => h.category === 'supplements');

  const takenCount = supplementHabits.filter(h => getCompletionForToday(h.id)).length;

  const total = supplementHabits.length;
  const progressPercent = total > 0 ? (takenCount / total) * 100 : 0;

  const weekDates = getCurrentWeekDates();
  const weekData = weekDates.map(date => {
    const dateKey = formatDateKey(date);
    const summary = dailySummaries[dateKey];
    const taken = summary
      ? supplementHabits.filter(h => summary.completions[h.id]).length
      : 0;
    return { date, taken, total };
  });

  const handleTake = (habit: Habit) => {
    const existing = getCompletionForToday(habit.id);
    if (existing) return;

    const points = completeHabit(habit.id, 'full' as CompletionType);
    if (points > 0) {
      recordDailyActivity();
      addPoints(points, true);
    }

    // Check if all supplements are now taken
    const newTakenCount = takenCount + 1;
    if (newTakenCount === total && total > 1) {
      const msg = ALL_TAKEN_MESSAGES[Math.floor(Math.random() * ALL_TAKEN_MESSAGES.length)];
      onMessage?.(msg);
    } else {
      const msg = TAKEN_MESSAGES[Math.floor(Math.random() * TAKEN_MESSAGES.length)];
      onMessage?.(msg);
    }
  };

  const handleUndo = (habit: Habit) => {
    const existing = getCompletionForToday(habit.id);
    if (!existing) return;
    uncompleteHabit(habit.id);
  };

  const [showWeekly, setShowWeekly] = useState(false);

  if (total === 0) {
    return (
      <Pressable
        style={({ pressed }) => [styles.emptyCard, pressed && styles.cardPressed]}
        onPress={onOpenLibrary}
      >
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>💊</Text>
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>Track Your Supplements</Text>
          <Text style={styles.emptySubtitle}>
            Add supplements from the Glow Stack to track daily
          </Text>
        </View>
        <Text style={styles.emptyArrow}>›</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>💊</Text>
          <Text style={styles.headerTitle}>My Supplements</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{takenCount}/{total}</Text>
          </View>
        </View>
        <Pressable onPress={() => setShowWeekly(!showWeekly)}>
          <Text style={styles.manageLink}>{showWeekly ? 'Hide' : 'This Week'}</Text>
        </Pressable>
      </View>

      {/* Pill row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {supplementHabits.map(habit => (
          <SupplementPill
            key={habit.id}
            habit={habit}
            completion={getCompletionForToday(habit.id)}
            onPress={() => handleTake(habit)}
            onLongPress={() => handleUndo(habit)}
          />
        ))}
      </ScrollView>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%` as any,
              backgroundColor: progressPercent >= 100 ? theme.success : theme.primary,
            },
          ]}
        />
      </View>

      {/* Weekly consistency (togglable) */}
      {showWeekly && (
        <View style={styles.weeklyContainer}>
          <WeeklyConsistencyView data={weekData} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEFAF9',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    color: '#3A2E2B',
  },
  countBadge: {
    backgroundColor: 'rgba(244, 198, 204, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 9999,
    marginLeft: spacing.sm,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#F2B4CC',
  },
  manageLink: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#F2B4CC',
  },
  pillRow: {
    paddingVertical: spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(244, 198, 204, 0.15)',
    borderRadius: 2,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  weeklyContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#EADBD4',
  },
  // Empty state
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFAF9',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  emptyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 198, 204, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emptyIcon: {
    fontSize: 20,
  },
  emptyContent: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#3A2E2B',
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#6B5B52',
  },
  emptyArrow: {
    fontSize: 22,
    color: '#9E8880',
  },
});
