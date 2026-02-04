import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Habit, CompletionType, HabitCompletion } from '../../types/habit';
import { useHabitStore } from '../../stores';
import { theme, spacing, borderRadius, shadows } from '../../theme';
import { categoryColors } from '../../theme/colors';

interface SupplementHabitListProps {
  onBrowseSupplements: () => void;
}

export const SupplementHabitList: React.FC<SupplementHabitListProps> = ({
  onBrowseSupplements,
}) => {
  const { habits, completeHabit, uncompleteHabit, getCompletionForToday } = useHabitStore();

  // Filter for active supplement habits
  const supplementHabits = habits.filter(
    h => h.category === 'supplements' && h.isActive
  ).sort((a, b) => a.order - b.order);

  // Count completions
  const completedCount = supplementHabits.filter(h => {
    const completion = getCompletionForToday(h.id);
    return completion !== undefined;
  }).length;

  const handleComplete = (habitId: string, type: CompletionType) => {
    Haptics.impactAsync(
      type === 'gentle'
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium
    );
    completeHabit(habitId, type);
  };

  const handleUncomplete = (habitId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    uncompleteHabit(habitId);
  };

  const categoryColor = categoryColors['supplements'] || theme.primary;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(232, 164, 200, 0.08)', 'rgba(212, 196, 232, 0.05)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionLabel}>TODAY'S SUPPLEMENTS</Text>
        </View>
        {supplementHabits.length > 0 && (
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completedCount}/{supplementHabits.length}
            </Text>
          </View>
        )}
      </View>

      {supplementHabits.length === 0 ? (
        <Pressable
          style={({ pressed }) => [
            styles.emptyState,
            pressed && { opacity: 0.8 },
          ]}
          onPress={onBrowseSupplements}
        >
          <Text style={styles.emptyIcon}>💊</Text>
          <Text style={styles.emptyText}>No supplements added yet</Text>
          <Text style={styles.emptySubtext}>
            Browse the library to add supplements to your stack
          </Text>
        </Pressable>
      ) : (
        <View style={styles.habitsList}>
          {supplementHabits.map((habit) => {
            const completion = getCompletionForToday(habit.id);
            const isGentlyCompleted = completion?.completionType === 'gentle';
            const isFullyCompleted = completion?.completionType === 'full';
            const isCompleted = isGentlyCompleted || isFullyCompleted;

            return (
              <View
                key={habit.id}
                style={[styles.habitCard, isCompleted && styles.habitCardCompleted]}
              >
                <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />
                <View style={styles.habitContent}>
                  <View style={styles.habitInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
                      <Text style={styles.icon}>{habit.icon}</Text>
                    </View>
                    <View style={styles.habitTextContainer}>
                      <Text
                        style={[styles.habitName, isCompleted && styles.habitNameCompleted]}
                        numberOfLines={1}
                      >
                        {habit.name}
                      </Text>
                      {habit.supplementMeta?.dosage && (
                        <Text style={styles.dosageText}>
                          {habit.supplementMeta.dosage}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.buttonsContainer}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.completionButton,
                        isGentlyCompleted ? styles.gentleActive : styles.gentleInactive,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() =>
                        isGentlyCompleted
                          ? handleUncomplete(habit.id)
                          : handleComplete(habit.id, 'gentle')
                      }
                    >
                      <Text
                        style={[styles.buttonLabel, isGentlyCompleted && styles.activeLabel]}
                      >
                        gently
                      </Text>
                      <Text
                        style={[styles.buttonPoints, isGentlyCompleted && styles.activeLabel]}
                      >
                        +5
                      </Text>
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.completionButton,
                        isFullyCompleted ? styles.fullyActive : styles.fullyInactive,
                        pressed && styles.buttonPressed,
                      ]}
                      onPress={() =>
                        isFullyCompleted
                          ? handleUncomplete(habit.id)
                          : handleComplete(habit.id, 'full')
                      }
                    >
                      <Text
                        style={[styles.buttonLabel, isFullyCompleted && styles.activeLabel]}
                      >
                        fully
                      </Text>
                      <Text
                        style={[styles.buttonPoints, isFullyCompleted && styles.activeLabel]}
                      >
                        +10
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.borderLight,
    overflow: 'hidden',
    ...shadows.sm,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textSecondary,
    letterSpacing: 0.5,
  },
  progressBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(232, 164, 200, 0.15)',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.primary,
  },
  habitsList: {
    gap: spacing.sm,
  },
  habitCard: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.borderLight,
    ...shadows.sm,
  },
  habitCardCompleted: {
    backgroundColor: '#FAFBFA',
    borderColor: theme.borderLight,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  habitContent: {
    padding: spacing.md,
    paddingTop: spacing.md - 2,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  habitTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    letterSpacing: -0.2,
  },
  habitNameCompleted: {
    color: theme.textSecondary,
  },
  dosageText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  completionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    gap: 6,
  },
  gentleInactive: {
    backgroundColor: '#FFF9F5',
    borderWidth: 1.5,
    borderColor: '#FFEDE0',
  },
  gentleActive: {
    backgroundColor: theme.secondary,
    borderWidth: 1.5,
    borderColor: theme.secondary,
    ...shadows.warmGlow,
  },
  fullyInactive: {
    backgroundColor: '#FFF5F7',
    borderWidth: 1.5,
    borderColor: '#FFE8ED',
  },
  fullyActive: {
    backgroundColor: theme.primary,
    borderWidth: 1.5,
    borderColor: theme.primary,
    ...shadows.glow,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    letterSpacing: -0.2,
  },
  buttonPoints: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.textMuted,
  },
  activeLabel: {
    color: theme.surface,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
