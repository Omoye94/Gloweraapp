import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore, useHabitStore, usePlantStore, useSupplementStore } from '../../src/stores';
import { HabitCard, CreateHabitModal } from '../../src/components/habits';
import { GlowMeter } from '../../src/components/garden';
import { PlantDisplay } from '../../src/components/garden';
import { SupplementSuggestionCard, SupplementTrackerSection } from '../../src/components/supplements';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';
import { getGreeting, formatDisplayDate } from '../../src/utils/dateUtils';
import { CompletionType } from '../../src/types/habit';

export default function HomeScreen() {
  const router = useRouter();
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  const navigateToGlowStack = () => {
    router.push('/glowstack');
  };

  const handleSupplementMessage = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const { user } = useUserStore();
  const { addPoints } = usePlantStore();
  const { plant, getProgressToNext, getPointsToNext } = usePlantStore();
  const {
    getActiveHabits,
    getTodayProgress,
    completeHabit,
    uncompleteHabit,
    getCompletionForToday,
  } = useHabitStore();

  const activeHabits = getActiveHabits();
  const todayProgress = getTodayProgress();
  const greeting = getGreeting();
  const today = formatDisplayDate(new Date());

  const handleCompleteHabit = (habitId: string, type: CompletionType) => {
    const pointsEarned = completeHabit(habitId, type);
    if (pointsEarned > 0) {
      addPoints(pointsEarned);
    }
  };

  const handleUncompleteHabit = (habitId: string) => {
    uncompleteHabit(habitId);
  };

  return (
    <View style={styles.container}>

      {/* Toast Message */}
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✨ {toastMessage}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.plantPreview}>
            <PlantDisplay
              stage={plant.currentStage}
              progressToNext={getProgressToNext()}
              pointsToNext={getPointsToNext()}
              totalPoints={plant.totalLifetimePoints}
              compact
            />
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${todayProgress.percentage}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {todayProgress.completed} of {todayProgress.total} rituals • {todayProgress.percentage}%
          </Text>
        </View>

        {/* Supplement Tracker */}
        <SupplementTrackerSection
          onMessage={handleSupplementMessage}
          onOpenLibrary={navigateToGlowStack}
        />

        {/* Explore Supplements Card */}
        <Pressable
          style={({ pressed }) => [
            styles.exploreCard,
            pressed && styles.exploreCardPressed,
          ]}
          onPress={navigateToGlowStack}
        >
          <LinearGradient
            colors={['rgba(232, 164, 200, 0.15)', 'rgba(212, 196, 232, 0.15)']}
            style={styles.exploreCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.exploreIconContainer}>
            <Text style={styles.exploreIcon}>💊</Text>
          </View>
          <View style={styles.exploreContent}>
            <Text style={styles.exploreTitle}>Explore Supplements</Text>
            <Text style={styles.exploreSubtitle}>
              Discover vitamins, minerals & more
            </Text>
          </View>
          <Text style={styles.exploreArrow}>›</Text>
        </Pressable>

        {/* Personalized Suggestions */}
        <SupplementSuggestionCard
          onViewSupplement={() => navigateToGlowStack()}
          onViewMore={navigateToGlowStack}
        />

        {/* Today's Habits Section */}
        <View style={styles.habitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Rituals</Text>
            <View style={styles.sectionHeaderRight}>
              <Pressable
                onPress={() => setShowCreateHabit(true)}
                style={({ pressed }) => [
                  styles.addHabitButton,
                  pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                ]}
              >
                <Text style={styles.addHabitButtonText}>+ Add</Text>
              </Pressable>
              <View style={styles.habitCountBadge}>
                <Text style={styles.habitCountText}>
                  {todayProgress.completed}/{todayProgress.total}
                </Text>
              </View>
            </View>
          </View>

          {activeHabits.length === 0 ? (
            <Pressable
              onPress={() => setShowCreateHabit(true)}
              style={({ pressed }) => [
                styles.emptyState,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              ]}
            >
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>Your garden awaits</Text>
              <Text style={styles.emptySubtext}>
                Tap here to add your first ritual
              </Text>
              <View style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>+ Create Ritual</Text>
              </View>
            </Pressable>
          ) : (
            <>
              {activeHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completion={getCompletionForToday(habit.id)}
                  onComplete={(type) => handleCompleteHabit(habit.id, type)}
                  onUncomplete={() => handleUncompleteHabit(habit.id)}
                />
              ))}

              {/* Add New Ritual Card */}
              <Pressable
                onPress={() => setShowCreateHabit(true)}
                style={({ pressed }) => [
                  styles.addRitualCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={styles.addRitualIconContainer}>
                  <Text style={styles.addRitualIcon}>+</Text>
                </View>
                <Text style={styles.addRitualText}>Add New Ritual</Text>
              </Pressable>
            </>
          )}
        </View>

        {/* Celebration Banner */}
        {todayProgress.percentage === 100 && (
          <View style={styles.celebrationBanner}>
            <LinearGradient
              colors={['#FFB199', '#FF99B5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.celebrationGradient}
            />
            <Text style={styles.celebrationEmoji}>✨</Text>
            <Text style={styles.celebrationText}>
              Beautiful! You've completed all your rituals today
            </Text>
          </View>
        )}

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create Habit Modal */}
      <CreateHabitModal
        visible={showCreateHabit}
        onClose={() => setShowCreateHabit(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.text,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },
  plantPreview: {
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(232, 164, 200, 0.25)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.primary,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  exploreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(232, 164, 200, 0.3)',
    overflow: 'hidden',
    ...shadows.md,
  },
  exploreCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  exploreCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  exploreIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 164, 200, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  exploreIcon: {
    fontSize: 22,
  },
  exploreContent: {
    flex: 1,
  },
  exploreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  exploreSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  exploreArrow: {
    fontSize: 24,
    fontWeight: '300',
    color: theme.textMuted,
  },
  habitsSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    letterSpacing: -0.3,
  },
  habitCountBadge: {
    backgroundColor: 'rgba(255, 153, 181, 0.15)',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  habitCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: theme.borderLight,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.card,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  celebrationGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  celebrationEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  celebrationText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.2,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addHabitButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.pill,
  },
  addHabitButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyStateButton: {
    marginTop: spacing.md,
    backgroundColor: theme.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addRitualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.borderLight,
    borderStyle: 'dashed',
  },
  addRitualIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(92, 45, 92, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  addRitualIcon: {
    fontSize: 22,
    fontWeight: '300',
    color: theme.primary,
  },
  addRitualText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  bottomSpacer: {
    height: 120,
  },
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 50,
    backgroundColor: 'rgba(158, 207, 176, 0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.card,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
  },
});
