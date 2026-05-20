import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Target, ChevronRight } from 'lucide-react-native';
import { useSupplementStore } from '../../stores';
import { WELLNESS_GOALS } from '../../constants/supplements';
import { spacing, shadows } from '../../theme';

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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionLabel}>YOUR WELLNESS GOALS</Text>
        </View>
        <Pressable
          onPress={handleEditPress}
          style={({ pressed }) => [
            styles.editButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.editText}>Edit</Text>
          <ChevronRight size={14} color="#F2B4CC" strokeWidth={2} />
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
          <Target size={28} color="#9E8880" strokeWidth={1.5} style={{ marginBottom: spacing.sm }} />
          <Text style={styles.emptyText}>Select your wellness goals</Text>
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
    backgroundColor: '#FEFAF9',
    borderRadius: 16,
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
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#6B5B52',
    letterSpacing: 0.8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 9999,
    backgroundColor: 'rgba(244, 198, 204, 0.12)',
  },
  editText: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    color: '#F2B4CC',
    letterSpacing: 0.5,
  },
  goalsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: '#FEFAF9',
    borderWidth: 1.5,
    borderColor: '#EADBD4',
  },
  goalIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  goalName: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#3A2E2B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
    color: '#3A2E2B',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'DMSans',
    color: '#6B5B52',
  },
});
