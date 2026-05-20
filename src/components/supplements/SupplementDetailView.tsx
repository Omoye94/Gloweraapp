import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SupplementInfo } from '../../types/supplement';
import { HealthDisclaimer } from './HealthDisclaimer';
import { theme, spacing, borderRadius, shadows } from '../../theme';
import { WELLNESS_GOALS } from '../../constants/supplements';

interface SupplementDetailViewProps {
  supplement: SupplementInfo;
  isAdded: boolean;
  onAddToHabits: (dosage: string, timing: string, notes: string) => void;
  onClose: () => void;
}

const TIMING_OPTIONS = [
  { id: 'morning', label: 'Morning', icon: '🌅' },
  { id: 'with-food', label: 'With Food', icon: '🍽️' },
  { id: 'evening', label: 'Evening', icon: '🌙' },
  { id: 'any', label: 'Any Time', icon: '⏰' },
];

export const SupplementDetailView: React.FC<SupplementDetailViewProps> = ({
  supplement,
  isAdded,
  onAddToHabits,
  onClose,
}) => {
  const [dosage, setDosage] = useState(supplement.typicalDosage);
  const [timing, setTiming] = useState(supplement.timing);
  const [notes, setNotes] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const handleAdd = () => {
    if (isAdded) return;
    onAddToHabits(dosage, timing, notes);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setJustAdded(true);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start();

    Animated.timing(bgAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
  };

  const addedBgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.primary, 'rgba(158, 207, 176, 0.85)'],
  });

  const getGoalInfo = (goalId: string) => {
    return WELLNESS_GOALS.find(g => g.id === goalId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Supplement Hero */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{supplement.icon}</Text>
          </View>
          <Text style={styles.name}>{supplement.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {supplement.category.replace('-', ' ')}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>{supplement.description}</Text>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            {supplement.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Typical Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typical Usage</Text>
          <View style={styles.usageCard}>
            <View style={styles.usageRow}>
              <Text style={styles.usageLabel}>Dosage</Text>
              <Text style={styles.usageValue}>{supplement.typicalDosage}</Text>
            </View>
            <View style={[styles.usageRow, styles.usageRowLast]}>
              <Text style={styles.usageLabel}>Best Time</Text>
              <Text style={styles.usageValue}>
                {TIMING_OPTIONS.find(t => t.id === supplement.timing)?.label || 'Any time'}
              </Text>
            </View>
          </View>
        </View>

        {/* Related Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supports These Goals</Text>
          <View style={styles.goalTags}>
            {supplement.tags.map((tag) => {
              const goal = getGoalInfo(tag);
              return (
                <View key={tag} style={styles.goalTag}>
                  <Text style={styles.goalIcon}>{goal?.icon}</Text>
                  <Text style={styles.goalText}>{goal?.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Health Disclaimer */}
        <View style={styles.section}>
          <HealthDisclaimer />
        </View>

        {/* Customisation — always visible when not yet added */}
        {!isAdded && !justAdded && (
          <View style={styles.addFormSection}>
            <Text style={styles.sectionTitle}>Customize Your Intake</Text>

            <Text style={styles.inputLabel}>Dosage</Text>
            <TextInput
              style={styles.textInput}
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g. 500mg, 1 capsule"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={styles.inputLabel}>When to Take</Text>
            <View style={styles.timingOptions}>
              {TIMING_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.timingOption,
                    timing === option.id && styles.timingOptionSelected,
                  ]}
                  onPress={() => setTiming(option.id as any)}
                >
                  <Text style={styles.timingIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.timingLabel,
                      timing === option.id && styles.timingLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any reminders for yourself..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomBar}>
        {isAdded || justAdded ? (
          <Animated.View
            style={[
              styles.addedState,
              justAdded && {
                backgroundColor: addedBgColor,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={[styles.addedIcon, justAdded && styles.addedIconBright]}>✓</Text>
            <Text style={[styles.addedStateText, justAdded && styles.addedTextBright]}>
              Added to Your Stack ✨
            </Text>
          </Animated.View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleAdd}
          >
            <Text style={styles.addButtonText}>Add to My Stack</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 17,
    fontWeight: '500',
    color: theme.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: 'rgba(232, 164, 200, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  icon: {
    fontSize: 40,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(232, 164, 200, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.primary,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    color: theme.textSecondary,
    lineHeight: 24,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 14,
    color: theme.success,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  benefitText: {
    fontSize: 15,
    color: theme.text,
  },
  usageCard: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
  },
  usageRowLast: {
    borderBottomWidth: 0,
  },
  usageLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  usageValue: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
  },
  goalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 196, 232, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  goalIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  goalText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text,
  },
  addFormSection: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: theme.backgroundWarm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: theme.backgroundWarm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  timingOptionSelected: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  timingIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  timingLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text,
  },
  timingLabelSelected: {
    color: theme.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.borderLight,
    ...shadows.lg,
  },
  addButton: {
    backgroundColor: theme.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  addButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textOnPrimary,
  },
  addedState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(158, 207, 176, 0.2)',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.button,
  },
  addedIcon: {
    fontSize: 16,
    color: theme.success,
    marginRight: spacing.sm,
    fontWeight: '600',
  },
  addedStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.success,
  },
  addedIconBright: {
    color: '#fff',
  },
  addedTextBright: {
    color: '#fff',
    fontWeight: '600',
  },
});
