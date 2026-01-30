import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserStore, useHabitStore, usePlantStore, useSupplementStore } from '../../src/stores';
import { HabitCard } from '../../src/components/habits';
import { GlowMeter } from '../../src/components/garden';
import { PlantDisplay } from '../../src/components/garden';
import { SupplementLibraryModal, SupplementSuggestionCard } from '../../src/components/supplements';
import { SupplementInfo } from '../../src/types/supplement';
import { theme, spacing, borderRadius, shadows } from '../../src/theme';
import { getGreeting, formatDisplayDate } from '../../src/utils/dateUtils';
import { CompletionType } from '../../src/types/habit';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [showSupplementLibrary, setShowSupplementLibrary] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<SupplementInfo | null>(null);

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
      {/* Warm gradient background */}
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

        {/* Glow Meter Card */}
        <View style={styles.meterCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,249,245,0.95)']}
            style={styles.meterCardGradient}
          />
          <GlowMeter progress={todayProgress.percentage} size={160} />
          <Text style={styles.progressSubtext}>
            {todayProgress.completed} of {todayProgress.total} habits
          </Text>
        </View>

        {/* Explore Supplements Card */}
        <Pressable
          style={({ pressed }) => [
            styles.exploreCard,
            pressed && styles.exploreCardPressed,
          ]}
          onPress={() => setShowSupplementLibrary(true)}
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
          onViewSupplement={(supplement) => {
            setSelectedSuggestion(supplement);
            setShowSupplementLibrary(true);
          }}
          onViewMore={() => setShowSupplementLibrary(true)}
        />

        {/* Today's Habits Section */}
        <View style={styles.habitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Rituals</Text>
            <View style={styles.habitCountBadge}>
              <Text style={styles.habitCountText}>
                {todayProgress.completed}/{todayProgress.total}
              </Text>
            </View>
          </View>

          {activeHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>Your garden awaits</Text>
              <Text style={styles.emptySubtext}>
                Add some habits in your profile to start growing
              </Text>
            </View>
          ) : (
            activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completion={getCompletionForToday(habit.id)}
                onComplete={(type) => handleCompleteHabit(habit.id, type)}
                onUncomplete={() => handleUncompleteHabit(habit.id)}
              />
            ))
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

      {/* Supplement Library Modal */}
      <SupplementLibraryModal
        visible={showSupplementLibrary}
        onClose={() => setShowSupplementLibrary(false)}
      />
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
  meterCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  meterCardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xxl,
  },
  progressSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    marginTop: spacing.md,
    letterSpacing: 0.3,
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
    ...shadows.sm,
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
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
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
  bottomSpacer: {
    height: 120,
  },
});
