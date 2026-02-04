import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlantStore, useUserStore } from '../../src/stores';
import { PlantDisplay } from '../../src/components/garden';
import { Card, ProgressBar } from '../../src/components/ui';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';
import { STAGE_ORDER, GROWTH_THRESHOLDS } from '../../src/types/plant';

export default function GardenScreen() {
  const { user } = useUserStore();
  const { plant, getProgressToNext, getPointsToNext } = usePlantStore();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF9F5', '#FFEDE5', '#FFF5F7']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{user?.gardenName || 'My Garden'}</Text>
          <Text style={styles.subtitle}>Watch your growth bloom</Text>
        </View>

        {/* Plant Display Card */}
        <View style={styles.plantCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.95)', 'rgba(255,249,245,0.98)']}
            style={styles.plantCardGradient}
          />
          <PlantDisplay
            stage={plant.currentStage}
            progressToNext={getProgressToNext()}
            pointsToNext={getPointsToNext()}
            totalPoints={plant.totalLifetimePoints}
          />
        </View>

        {/* Growth Journey */}
        <View style={styles.journeySection}>
          <Text style={styles.sectionTitle}>Growth Journey</Text>

          <View style={styles.stagesContainer}>
            {STAGE_ORDER.map((stage, index) => {
              const isReached = plant.totalLifetimePoints >= GROWTH_THRESHOLDS[stage];
              const isCurrent = plant.currentStage === stage;

              return (
                <View key={stage} style={styles.stageItem}>
                  <View
                    style={[
                      styles.stageIndicator,
                      isReached && styles.stageReached,
                      isCurrent && styles.stageCurrent,
                    ]}
                  >
                    <Text style={styles.stageEmoji}>
                      {stage === 'seed' ? '🌰' :
                       stage === 'sprout' ? '🌱' :
                       stage === 'bud' ? '🌿' :
                       stage === 'bloom' ? '🌸' : '🌺'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stageName,
                      isReached && styles.stageNameReached,
                    ]}
                  >
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </Text>
                  <Text style={styles.stagePoints}>
                    {GROWTH_THRESHOLDS[stage]} pts
                  </Text>

                  {index < STAGE_ORDER.length - 1 && (
                    <View
                      style={[
                        styles.connector,
                        isReached && styles.connectorReached,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FFFFFF', '#FFF9F5']}
                style={styles.statCardGradient}
              />
              <Text style={styles.statValue}>{plant.totalLifetimePoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#FFFFFF', '#FFF5F7']}
                style={styles.statCardGradient}
              />
              <Text style={styles.statValue}>
                {STAGE_ORDER.indexOf(plant.currentStage) + 1}/{STAGE_ORDER.length}
              </Text>
              <Text style={styles.statLabel}>Growth Stage</Text>
            </View>
          </View>
        </View>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <LinearGradient
            colors={['rgba(255,153,181,0.08)', 'rgba(255,177,153,0.08)']}
            style={styles.motivationGradient}
          />
          <Text style={styles.motivationEmoji}>💜</Text>
          <Text style={styles.motivationText}>
            Your garden grows at your pace. Every small step counts, and progress is never lost.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  plantCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  plantCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  journeySection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  stagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xs,
  },
  stageItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  stageIndicator: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFF3EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stageReached: {
    backgroundColor: theme.secondaryLight,
  },
  stageCurrent: {
    borderColor: theme.primary,
    backgroundColor: 'rgba(255, 153, 181, 0.15)',
  },
  stageEmoji: {
    fontSize: 24,
  },
  stageName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    letterSpacing: 0.2,
  },
  stageNameReached: {
    color: theme.text,
  },
  stagePoints: {
    fontSize: 10,
    color: theme.textMuted,
    marginTop: 2,
  },
  connector: {
    position: 'absolute',
    top: 26,
    right: -16,
    width: 32,
    height: 2,
    backgroundColor: '#FFEDE0',
    borderRadius: 1,
  },
  connectorReached: {
    backgroundColor: theme.secondary,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  statCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: spacing.xs,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 181, 0.2)',
  },
  motivationGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  motivationEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  motivationText: {
    fontSize: 14,
    color: theme.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 120,
  },
});
