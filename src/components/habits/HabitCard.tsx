import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { Habit, HabitCompletion } from '../../types/habit';
import { shadows } from '../../theme';
import { categoryColors } from '../../theme/colors';

interface HabitCardProps {
  habit: Habit;
  completion?: HabitCompletion;
  onComplete: () => void;
  onUncomplete: () => void;
  onIncrement?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completion,
  onComplete,
  onUncomplete,
  onIncrement,
}) => {
  const categoryColor = categoryColors[habit.category] || '#C45A82';
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const hasTarget = !!habit.targetValue && habit.targetValue > 1;
  const progressValue = completion?.progressValue ?? 0;
  const targetValue = habit.targetValue ?? 1;
  const unit = habit.unit ?? 'times';
  const isCompleted = completion?.completionType === 'full' || (!hasTarget && !!completion);

  const runCheckAnimation = () => {
    checkAnim.setValue(0);
    Animated.spring(checkAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, friction: 8 }),
      Animated.spring(scaleAnim, { toValue: 1.0, friction: 5, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = () => {
    if (isCompleted) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUncomplete();
    } else if (hasTarget && onIncrement) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIncrement();
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      runCheckAnimation();
      onComplete();
    }
  };

  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 1.2, 1],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.inner, pressed && styles.innerPressed]}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, isCompleted && styles.checkboxChecked]}>
          {isCompleted && (
            <Animated.View style={{ transform: [{ scale: checkScale }] }}>
              <Check size={14} color="#FEFAF9" strokeWidth={3} />
            </Animated.View>
          )}
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.name, isCompleted && styles.nameCompleted]}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          {hasTarget && (
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((progressValue / targetValue) * 100, 100)}%`,
                      backgroundColor: categoryColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {progressValue}/{targetValue} {unit}
              </Text>
            </View>
          )}
        </View>

        {/* Category dot */}
        <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 14,
    ...shadows.sm,
  },
  inner: {
    backgroundColor: '#FEFAF9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerPressed: {
    opacity: 0.85,
  },

  // Checkbox
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#EADBD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#C45A82',
    borderColor: '#C45A82',
  },

  // Text
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
  },
  nameCompleted: {
    color: '#B8A09C',
    textDecorationLine: 'line-through',
  },

  // Progress (for target habits)
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#EDE4E2',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 9999,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: '#9E8880',
    minWidth: 60,
    textAlign: 'right',
  },

  // Category dot
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
    opacity: 0.7,
  },
});
