import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useChallengeStore, usePlantStore } from '../../src/stores';
import { ProgressBar } from '../../src/components/ui';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';
import { DEFAULT_CHALLENGES, getChallengeById } from '../../src/constants/challenges';

export default function ChallengesScreen() {
  const {
    getActiveChallenge,
    getCompletedChallenges,
    startChallenge,
    completeDay,
    getChallengeProgress,
    getCurrentDay,
    isDayCompleted,
  } = useChallengeStore();
  const { addPoints } = usePlantStore();

  const activeChallenge = getActiveChallenge();
  const completedChallenges = getCompletedChallenges();
  const activeChallengeInfo = activeChallenge ? getChallengeById(activeChallenge.challengeId) : null;

  const handleStartChallenge = (challengeId: string) => {
    startChallenge(challengeId);
  };

  const handleCompleteDay = () => {
    if (activeChallenge) {
      const currentDay = getCurrentDay(activeChallenge.id);
      const points = completeDay(activeChallenge.id, currentDay);
      if (points > 0) {
        addPoints(points);
      }
    }
  };

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
          <Text style={styles.title}>Goals</Text>
          <Text style={styles.subtitle}>Optional wellness journeys</Text>
        </View>

        {/* Active Challenge */}
        {activeChallenge && activeChallengeInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goal</Text>
            <View style={styles.activeCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,249,245,0.98)']}
                style={styles.activeCardGradient}
              />
              <View style={styles.activeHeader}>
                <View style={styles.activeIconContainer}>
                  <Text style={styles.activeIcon}>{activeChallengeInfo.icon}</Text>
                </View>
                <View style={styles.activeInfo}>
                  <Text style={styles.activeName}>{activeChallengeInfo.name}</Text>
                  <Text style={styles.activeDay}>
                    Day {getCurrentDay(activeChallenge.id)} of {activeChallengeInfo.duration}
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={getChallengeProgress(activeChallenge.id).percentage}
                  height={8}
                  color={theme.primary}
                />
              </View>

              {/* Today's task */}
              <View style={styles.todayTask}>
                <Text style={styles.todayLabel}>Today's Task</Text>
                <Text style={styles.todayText}>
                  {activeChallengeInfo.dailyTasks[getCurrentDay(activeChallenge.id) - 1]?.description}
                </Text>
              </View>

              {!isDayCompleted(activeChallenge.id, getCurrentDay(activeChallenge.id)) ? (
                <Pressable
                  style={({ pressed }) => [styles.completeButton, pressed && styles.completeButtonPressed]}
                  onPress={handleCompleteDay}
                >
                  <LinearGradient
                    colors={['#FFB199', '#FF99B5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.completeButtonGradient}
                  />
                  <Text style={styles.completeButtonText}>Complete Today's Task</Text>
                </Pressable>
              ) : (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>Today's task completed ✨</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Available Challenges */}
        {!activeChallenge && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Goals</Text>
            {DEFAULT_CHALLENGES.map((challenge) => {
              const isCompleted = completedChallenges.some(
                c => c.challengeId === challenge.id
              );

              return (
                <View key={challenge.id} style={styles.challengeCard}>
                  <View style={styles.challengeHeader}>
                    <View style={styles.challengeIconContainer}>
                      <Text style={styles.challengeIcon}>{challenge.icon}</Text>
                    </View>
                    <View style={styles.challengeInfo}>
                      <Text style={styles.challengeName}>{challenge.name}</Text>
                      <Text style={styles.challengeDuration}>
                        {challenge.duration} days • {challenge.pointsReward} pts
                      </Text>
                    </View>
                    {isCompleted && (
                      <View style={styles.completedTag}>
                        <Text style={styles.completedTagText}>Done</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.challengeDescription} numberOfLines={2}>
                    {challenge.description}
                  </Text>
                  {!isCompleted && (
                    <Pressable
                      style={({ pressed }) => [styles.startButton, pressed && { opacity: 0.8 }]}
                      onPress={() => handleStartChallenge(challenge.id)}
                    >
                      <Text style={styles.startButtonText}>Start Goal</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedChallenges.map((userChallenge) => {
              const challenge = getChallengeById(userChallenge.challengeId);
              if (!challenge) return null;

              return (
                <View key={userChallenge.id} style={styles.completedCard}>
                  <View style={styles.completedIconContainer}>
                    <Text style={styles.completedIcon}>{challenge.icon}</Text>
                  </View>
                  <Text style={styles.completedName}>{challenge.name}</Text>
                  <View style={styles.completedPointsBadge}>
                    <Text style={styles.completedPoints}>+{userChallenge.pointsEarned}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <LinearGradient
            colors={['rgba(255,153,181,0.08)', 'rgba(255,177,153,0.08)']}
            style={styles.motivationGradient}
          />
          <Text style={styles.motivationEmoji}>🌟</Text>
          <Text style={styles.motivationText}>
            Goals are optional wellness journeys. No pressure — try one when you feel ready!
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  activeCard: {
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  activeCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  activeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 153, 181, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activeIcon: {
    fontSize: 28,
  },
  activeInfo: {
    flex: 1,
  },
  activeName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: -0.3,
  },
  activeDay: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  todayTask: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  todayText: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 22,
  },
  completeButton: {
    borderRadius: borderRadius.button,
    overflow: 'hidden',
    ...shadows.glow,
  },
  completeButtonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  completeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedBadge: {
    backgroundColor: 'rgba(158, 207, 176, 0.2)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(158, 207, 176, 0.3)',
  },
  completedBadgeText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.accent,
  },
  challengeCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  challengeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 177, 153, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  challengeIcon: {
    fontSize: 22,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  challengeDuration: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 2,
  },
  completedTag: {
    backgroundColor: theme.accent,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.pill,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  challengeDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  startButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.button,
    borderWidth: 1.5,
    borderColor: theme.primary,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  completedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(158, 207, 176, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  completedIcon: {
    fontSize: 20,
  },
  completedName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    flex: 1,
  },
  completedPointsBadge: {
    backgroundColor: 'rgba(158, 207, 176, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.pill,
  },
  completedPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.accent,
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
