import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Pill, MoreHorizontal } from 'lucide-react-native';
import { Habit, CompletionType, HabitCompletion } from '../../types/habit';
import { useHabitStore } from '../../stores';
import { theme, spacing, borderRadius, shadows } from '../../theme';
import { categoryColors } from '../../theme/colors';

interface SupplementHabitListProps {
  onBrowseSupplements: () => void;
  onRemoveSupplement?: (habitId: string, supplementInfoId?: string) => void;
  onEditSupplement?: (habitId: string, currentDosage?: string) => void;
}

export const SupplementHabitList: React.FC<SupplementHabitListProps> = ({
  onBrowseSupplements,
  onRemoveSupplement,
  onEditSupplement,
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

  const handleSupplementMenu = (habit: Habit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      habit.name,
      habit.supplementMeta?.dosage || undefined,
      [
        {
          text: 'Edit Dosage',
          onPress: () => onEditSupplement?.(habit.id, habit.supplementMeta?.dosage),
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemoveSupplement?.(habit.id, habit.supplementMeta?.supplementInfoId),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const categoryColor = categoryColors['supplements'] || theme.primary;

  return (
    <View style={styles.container}>
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
          <Pill size={32} color={theme.textMuted} strokeWidth={1.5} style={{ marginBottom: spacing.sm }} />
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
                    <Pressable
                      style={({ pressed }) => [
                        styles.menuButton,
                        pressed && { opacity: 0.5 },
                      ]}
                      onPress={() => handleSupplementMenu(habit)}
                      hitSlop={8}
                    >
                      <MoreHorizontal size={18} strokeWidth={1.5} color={theme.textMuted} />
                    </Pressable>
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
    backgroundColor: '#FEFAF9',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.sm,
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
    color: '#6B5B52',
    letterSpacing: 0.5,
  },
  progressBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: '#EADBD4',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F2B4CC',
  },
  habitsList: {
    gap: spacing.sm,
  },
  habitCard: {
    backgroundColor: '#FEFAF9',
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.sm,
  },
  habitCardCompleted: {
    backgroundColor: '#F4E8E0',
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
  menuButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A2E2B',
    letterSpacing: -0.2,
  },
  habitNameCompleted: {
    color: '#6B5B52',
  },
  dosageText: {
    fontSize: 12,
    color: '#6B5B52',
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
    backgroundColor: '#FEFAF9',
    borderWidth: 1.5,
    borderColor: '#EADBD4',
  },
  gentleActive: {
    backgroundColor: theme.secondary,
    borderWidth: 1.5,
    borderColor: theme.secondary,
    ...shadows.warmGlow,
  },
  fullyInactive: {
    backgroundColor: '#FEFAF9',
    borderWidth: 1.5,
    borderColor: '#EADBD4',
  },
  fullyActive: {
    backgroundColor: '#F2B4CC',
    borderWidth: 1.5,
    borderColor: '#F2B4CC',
    ...shadows.glow,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B5B52',
    letterSpacing: -0.2,
  },
  buttonPoints: {
    fontSize: 11,
    fontWeight: '500',
    color: '#A09080',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3A2E2B',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6B5B52',
    textAlign: 'center',
  },
});
