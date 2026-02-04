import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupplementStore } from '../../stores';
import { WELLNESS_GOALS } from '../../constants/supplements';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface GlowStackHeaderProps {
  onEditGoals: () => void;
}

export const GlowStackHeader: React.FC<GlowStackHeaderProps> = ({
  onEditGoals,
}) => {
  const { wellnessGoals } = useSupplementStore();

  const selectedGoalsInfo = WELLNESS_GOALS.filter(g =>
    wellnessGoals.includes(g.id)
  );

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEditGoals();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(212, 196, 232, 0.15)', 'rgba(232, 164, 200, 0.1)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionLabel}>WELLNESS FOCUS</Text>
        </View>
        <Pressable
          onPress={handleEditPress}
          style={({ pressed }) => [
            styles.editButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.editText}>Edit</Text>
          <Text style={styles.editArrow}>›</Text>
        </Pressable>
      </View>

      {selectedGoalsInfo.length === 0 ? (
        <Pressable
          style={({ pressed }) => [
            styles.emptyState,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleEditPress}
        >
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyText}>Set your wellness goals</Text>
          <Text style={styles.emptySubtext}>
            Get personalized supplement suggestions
          </Text>
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.goalsContainer}
        >
          {selectedGoalsInfo.map((goal) => (
            <View key={goal.id} style={styles.goalChip}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={styles.goalName}>{goal.name}</Text>
            </View>
          ))}
        </ScrollView>
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(212, 196, 232, 0.2)',
  },
  editText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.primary,
  },
  editArrow: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.primary,
    marginLeft: 2,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(232, 164, 200, 0.3)',
  },
  goalIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  goalName: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIcon: {
    fontSize: 28,
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
  },
});
