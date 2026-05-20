import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Sprout } from 'lucide-react-native';
import { useHabitStore, usePlantStore } from '../../src/stores';
import { CreateHabitModal } from '../../src/components/habits';
import { HabitCard } from '../../src/components/habits/HabitCard';
import { CalendarStrip } from '../../src/components/home';
import { spacing, shadows } from '../../src/theme';
import { gradients } from '../../src/theme/colors';
import { formatDateKey } from '../../src/utils/dateUtils';

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showCreateHabit, setShowCreateHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      setSelectedDate(new Date());
    }, []),
  );

  const {
    getActiveHabits,
    getProgressForDate,
    getCompletionForDate,
    completeHabit,
    uncompleteHabit,
    incrementHabitProgress,
  } = useHabitStore();

  const { addPoints, recordDailyActivity } = usePlantStore();

  const activeHabits = getActiveHabits();
  const dateKey = formatDateKey(selectedDate);
  const progress = getProgressForDate(dateKey);
  const isToday = formatDateKey() === dateKey;

  const handleComplete = (habitId: string) => {
    if (!isToday) return;
    recordDailyActivity();
    const pts = completeHabit(habitId, 'full');
    if (pts > 0) addPoints(pts, true);
  };

  const handleIncrement = (habitId: string) => {
    if (!isToday) return;
    recordDailyActivity();
    const pts = incrementHabitProgress(habitId);
    if (pts > 0) addPoints(pts, true);
  };

  const handleUncomplete = (habitId: string) => {
    if (!isToday) return;
    uncompleteHabit(habitId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          hitSlop={12}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        {/* Gradient header */}
        <LinearGradient
          colors={gradients.softBloom as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.label}>YOUR RITUALS</Text>
            <Text style={styles.title}>All Habits</Text>
            <Text style={styles.subtitle}>
              {progress.completed}/{progress.total} complete today
            </Text>
          </View>
          <Pressable
            onPress={() => setShowCreateHabit(true)}
            style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
          >
            <Plus size={22} color="#FFFAF8" strokeWidth={2} />
          </Pressable>
        </LinearGradient>

        <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {activeHabits.length === 0 ? (
          <Pressable
            onPress={() => setShowCreateHabit(true)}
            style={({ pressed }) => [styles.emptyState, pressed && { opacity: 0.9 }]}
          >
            <Sprout size={40} color="#9B86D4" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>Your rituals await</Text>
            <Text style={styles.emptySubtext}>Tap to add your first habit</Text>
          </Pressable>
        ) : (
          <View style={styles.list}>
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completion={getCompletionForDate(habit.id, dateKey)}
                onComplete={() => handleComplete(habit.id)}
                onUncomplete={() => handleUncomplete(habit.id)}
                onIncrement={() => handleIncrement(habit.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <CreateHabitModal visible={showCreateHabit} onClose={() => setShowCreateHabit(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF6F2' },
  content: { paddingHorizontal: 0 },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.lg,
    marginBottom: 4,
  },
  backArrow: {
    fontSize: 24,
    color: '#3A2E2B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderRadius: 26,
    ...shadows.sm,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  label: {
    fontSize: 11,
    fontFamily: 'SpaceMono-Bold',
    color: '#C45A82',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#6B5752',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C45A82',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  list: { gap: 12, paddingHorizontal: spacing.lg },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginHorizontal: spacing.lg,
    backgroundColor: '#FFFAF8',
    borderRadius: 18,
    ...shadows.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'DMSans',
    color: '#9E8880',
  },
});
