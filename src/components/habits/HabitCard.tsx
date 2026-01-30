import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Habit, CompletionType, HabitCompletion } from '../../types/habit';
import { theme, spacing, borderRadius, shadows } from '../../theme';
import { categoryColors } from '../../theme/colors';

interface HabitCardProps {
  habit: Habit;
  completion?: HabitCompletion;
  onComplete: (type: CompletionType) => void;
  onUncomplete: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completion,
  onComplete,
  onUncomplete,
}) => {
  const categoryColor = categoryColors[habit.category] || theme.primary;
  const isGentlyCompleted = completion?.completionType === 'gentle';
  const isFullyCompleted = completion?.completionType === 'full';
  const isCompleted = isGentlyCompleted || isFullyCompleted;

  const handleGentlyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isGentlyCompleted) {
      onUncomplete();
    } else {
      onComplete('gentle');
    }
  };

  const handleFullyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFullyCompleted) {
      onUncomplete();
    } else {
      onComplete('full');
    }
  };

  return (
    <View style={[styles.container, isCompleted && styles.completedContainer]}>
      {/* Category accent bar */}
      <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

      <View style={styles.mainContent}>
        {/* Icon and name */}
        <View style={styles.habitInfo}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
          <View style={styles.habitTextContainer}>
            <Text style={[styles.name, isCompleted && styles.completedText]} numberOfLines={2}>
              {habit.name}
            </Text>
            {/* Supplement metadata */}
            {habit.category === 'supplements' && habit.supplementMeta && (
              <View style={styles.supplementMeta}>
                {habit.supplementMeta.dosage && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>💊</Text>
                    <Text style={styles.metaText}>{habit.supplementMeta.dosage}</Text>
                  </View>
                )}
                {habit.supplementMeta.timingPreference && (
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>
                      {habit.supplementMeta.timingPreference === 'morning' ? '🌅' :
                       habit.supplementMeta.timingPreference === 'evening' ? '🌙' :
                       habit.supplementMeta.timingPreference === 'with-food' ? '🍽️' : '⏰'}
                    </Text>
                    <Text style={styles.metaText}>
                      {habit.supplementMeta.timingPreference === 'morning' ? 'Morning' :
                       habit.supplementMeta.timingPreference === 'evening' ? 'Evening' :
                       habit.supplementMeta.timingPreference === 'with-food' ? 'With food' : 'Any time'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Completion buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.completionButton,
              isGentlyCompleted ? styles.gentleActive : styles.gentleInactive,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleGentlyPress}
          >
            <Text style={[
              styles.buttonLabel,
              isGentlyCompleted && styles.activeLabel,
            ]}>
              gently
            </Text>
            <Text style={[
              styles.buttonPoints,
              isGentlyCompleted && styles.activeLabel,
            ]}>
              +5
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.completionButton,
              isFullyCompleted ? styles.fullyActive : styles.fullyInactive,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleFullyPress}
          >
            <Text style={[
              styles.buttonLabel,
              isFullyCompleted && styles.activeLabel,
            ]}>
              fully
            </Text>
            <Text style={[
              styles.buttonPoints,
              isFullyCompleted && styles.activeLabel,
            ]}>
              +10
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    marginBottom: spacing.sm + 4,
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  completedContainer: {
    backgroundColor: '#FAFBFA',
    borderColor: theme.borderLight,
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  mainContent: {
    padding: spacing.md,
    paddingTop: spacing.md - 2,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  icon: {
    fontSize: 22,
  },
  habitTextContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text,
    letterSpacing: -0.2,
  },
  completedText: {
    color: theme.textSecondary,
  },
  supplementMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 164, 200, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  metaIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  metaText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
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
    paddingVertical: spacing.sm + 2,
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
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
    letterSpacing: -0.2,
  },
  buttonPoints: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.textMuted,
  },
  activeLabel: {
    color: theme.surface,
  },
});
