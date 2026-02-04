import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GrowthStage, STAGE_NAMES, STAGE_DESCRIPTIONS } from '../../types/plant';
import { theme, typography, spacing, borderRadius } from '../../theme';
import { ProgressBar } from '../ui/ProgressBar';

interface PlantDisplayProps {
  stage: GrowthStage;
  progressToNext: number;
  pointsToNext: number;
  totalPoints: number;
  compact?: boolean;
}

// Plant emoji representations for each stage
const PLANT_EMOJIS: Record<GrowthStage, string> = {
  seed: '🌰',
  sprout: '🌱',
  bud: '🌿',
  bloom: '🌸',
  glow: '🌺',
};

export const PlantDisplay: React.FC<PlantDisplayProps> = ({
  stage,
  progressToNext,
  pointsToNext,
  totalPoints,
  compact = false,
}) => {
  const emoji = PLANT_EMOJIS[stage];
  const stageName = STAGE_NAMES[stage];
  const stageDescription = STAGE_DESCRIPTIONS[stage];
  const isMaxStage = stage === 'glow';

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactEmoji}>{emoji}</Text>
        <View style={styles.compactInfo}>
          <Text style={styles.compactStage}>{stageName}</Text>
          <Text style={styles.compactPoints}>{totalPoints} pts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.plantContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      <Text style={styles.stageName}>{stageName}</Text>
      <Text style={styles.description}>{stageDescription}</Text>

      <View style={styles.progressSection}>
        <View style={styles.pointsRow}>
          <Text style={styles.totalPoints}>{totalPoints} points</Text>
          {!isMaxStage && (
            <Text style={styles.nextStagePoints}>{pointsToNext} to next stage</Text>
          )}
        </View>

        {!isMaxStage && (
          <ProgressBar
            progress={progressToNext}
            height={6}
            color={theme.accent}
          />
        )}

        {isMaxStage && (
          <Text style={styles.maxStageText}>You've reached full bloom!</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  plantContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 80,
  },
  stageName: {
    ...typography.h3,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  progressSection: {
    width: '100%',
    maxWidth: 280,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalPoints: {
    ...typography.label,
    color: theme.text,
  },
  nextStagePoints: {
    ...typography.caption,
    color: theme.textMuted,
  },
  maxStageText: {
    ...typography.body,
    color: theme.accent,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  compactEmoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactStage: {
    ...typography.label,
    color: theme.text,
  },
  compactPoints: {
    ...typography.caption,
    color: theme.textSecondary,
  },
});
