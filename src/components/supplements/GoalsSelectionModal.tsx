import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { WellnessGoal } from '../../types/supplement';
import { WELLNESS_GOALS } from '../../constants/supplements';
import { useSupplementStore } from '../../stores';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface GoalsSelectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GoalsSelectionModal: React.FC<GoalsSelectionModalProps> = ({
  visible,
  onClose,
}) => {
  const { wellnessGoals, setWellnessGoals } = useSupplementStore();
  const [selectedGoals, setSelectedGoals] = useState<WellnessGoal[]>([]);

  // Initialize with current goals when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedGoals([...wellnessGoals]);
    }
  }, [visible, wellnessGoals]);

  const handleToggleGoal = (goalId: WellnessGoal) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        return prev.filter((g) => g !== goalId);
      } else {
        return [...prev, goalId];
      }
    });
  };

  const handleSave = () => {
    setWellnessGoals(selectedGoals);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const handleClearAll = () => {
    setSelectedGoals([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <LinearGradient
            colors={['#FFFFFF', '#FAF5FC']}
            style={styles.gradientBackground}
          />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Wellness Goals</Text>
              <Text style={styles.subtitle}>
                Select your focus areas for personalized suggestions
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={styles.closeButton}>Cancel</Text>
            </Pressable>
          </View>

          {/* Goals Grid */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.goalsGrid}>
              {WELLNESS_GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <Pressable
                    key={goal.id}
                    style={({ pressed }) => [
                      styles.goalCard,
                      isSelected && styles.goalCardSelected,
                      pressed && styles.goalCardPressed,
                    ]}
                    onPress={() => handleToggleGoal(goal.id)}
                  >
                    <View
                      style={[
                        styles.goalIconContainer,
                        isSelected && styles.goalIconContainerSelected,
                      ]}
                    >
                      <Text style={styles.goalIcon}>{goal.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.goalName,
                        isSelected && styles.goalNameSelected,
                      ]}
                    >
                      {goal.name}
                    </Text>
                    <Text style={styles.goalDescription} numberOfLines={2}>
                      {goal.description}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {selectedGoals.length > 0 && (
              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </Pressable>
            )}
            <View style={{ flex: 1 }} />
            <Text style={styles.selectedCount}>
              {selectedGoals.length} selected
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    height: '85%',
    overflow: 'hidden',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    maxWidth: 250,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textSecondary,
    paddingHorizontal: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: theme.borderLight,
    position: 'relative',
    minHeight: 130,
  },
  goalCardSelected: {
    backgroundColor: 'rgba(212, 196, 232, 0.15)',
    borderColor: theme.primary,
  },
  goalCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 196, 232, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  goalIconContainerSelected: {
    backgroundColor: theme.primaryLight,
  },
  goalIcon: {
    fontSize: 22,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  goalNameSelected: {
    color: theme.primary,
  },
  goalDescription: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 16,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.textOnPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    backgroundColor: theme.surface,
  },
  clearButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  selectedCount: {
    fontSize: 14,
    color: theme.textMuted,
    marginRight: spacing.md,
  },
  saveButton: {
    backgroundColor: theme.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textOnPrimary,
  },
});
