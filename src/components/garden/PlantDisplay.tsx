import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GrowthStage, STAGE_NAMES, STAGE_DESCRIPTIONS, COSMETIC_UNLOCKS } from '../../types/plant';
import { theme, typography, spacing, borderRadius } from '../../theme';
import { ProgressBar } from '../ui/ProgressBar';
import { getPrestigePoints } from '../../utils/pointsCalculator';
import { TreeScene, TimeOfDay } from './tree';
import { AmbientElements } from './AmbientElements';

interface PlantDisplayProps {
  stage: GrowthStage;
  progressToNext: number;
  pointsToNext: number;
  totalPoints: number;
  compact?: boolean;
  particleColorId?: string;
  timeOfDay?: TimeOfDay;
  pointsTimestamp?: number;
}

export const PlantDisplay: React.FC<PlantDisplayProps> = ({
  stage,
  progressToNext,
  pointsToNext,
  totalPoints,
  compact = false,
  particleColorId = 'default',
  timeOfDay = 'day',
  pointsTimestamp,
}) => {
  const stageName = STAGE_NAMES[stage];
  const stageDescription = STAGE_DESCRIPTIONS[stage];
  const isMaxStage = stage === 'glow';

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TreeScene
          stage={stage}
          progressToNext={progressToNext}
          compact
          particleColorId={particleColorId}
        />
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
        <TreeScene
          stage={stage}
          progressToNext={progressToNext}
          particleColorId={particleColorId}
          timeOfDay={timeOfDay}
          pointsTimestamp={pointsTimestamp}
        />
        <AmbientElements stage={stage} timeOfDay={timeOfDay} />
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

        {isMaxStage && (() => {
          const prestigePts = getPrestigePoints(totalPoints);
          const nextCosmetic = COSMETIC_UNLOCKS.find(
            c => c.prestigePointsRequired > prestigePts
          );
          if (nextCosmetic) {
            const progress = Math.round(
              (prestigePts / nextCosmetic.prestigePointsRequired) * 100
            );
            return (
              <View style={{ width: '100%', gap: spacing.xs }}>
                <Text style={styles.maxStageText}>
                  {nextCosmetic.emoji} Next: {nextCosmetic.name}
                </Text>
                <ProgressBar progress={progress} height={6} color="#F2B4CC" />
                <Text style={[styles.nextStagePoints, { textAlign: 'center' }]}>
                  {prestigePts.toLocaleString()} / {nextCosmetic.prestigePointsRequired.toLocaleString()} prestige pts
                </Text>
              </View>
            );
          }
          return (
            <Text style={styles.maxStageText}>All cosmetics unlocked! Keep glowing</Text>
          );
        })()}
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
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stageName: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    color: '#3A2E2B',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#6B5B52',
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
    fontSize: 13,
    fontFamily: 'SpaceMono-Bold',
    color: '#3A2E2B',
    letterSpacing: 0.5,
  },
  nextStagePoints: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#9E8880',
  },
  maxStageText: {
    fontSize: 15,
    fontFamily: 'DMSans',
    color: '#F2B4CC',
    textAlign: 'center',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFAF9',
    borderRadius: 16,
    padding: spacing.sm,
  },
  compactInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  compactStage: {
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    color: '#3A2E2B',
  },
  compactPoints: {
    fontSize: 12,
    fontFamily: 'DMSans',
    color: '#6B5B52',
  },
});
