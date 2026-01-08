import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../src/components/ui';
import { theme, typography, spacing, borderRadius, shadows } from '../../src/theme';
import { DEFAULT_HABITS, HABIT_CATEGORIES, DefaultHabit } from '../../src/constants/habits';
import { HabitCategory } from '../../src/types/habit';
import { useHabitStore } from '../../src/stores';

export default function SelectHabitsScreen() {
  const router = useRouter();
  const { addHabits } = useHabitStore();
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('nutrition');
  const [selectedHabits, setSelectedHabits] = useState<DefaultHabit[]>([]);

  const categoryHabits = DEFAULT_HABITS.filter(h => h.category === selectedCategory);
  const canProceed = selectedHabits.length >= 3 && selectedHabits.length <= 5;

  const toggleHabit = (habit: DefaultHabit) => {
    const isSelected = selectedHabits.some(h => h.name === habit.name);

    if (isSelected) {
      setSelectedHabits(selectedHabits.filter(h => h.name !== habit.name));
    } else if (selectedHabits.length < 5) {
      setSelectedHabits([...selectedHabits, habit]);
    }
  };

  const isHabitSelected = (habit: DefaultHabit) => {
    return selectedHabits.some(h => h.name === habit.name);
  };

  const handleContinue = () => {
    // Add selected habits to store
    addHabits(selectedHabits.map(h => ({
      name: h.name,
      category: h.category,
      icon: h.icon,
      isCustom: false,
    })));

    router.push('/(auth)/name-garden');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Habits</Text>
        <Text style={styles.subtitle}>
          Select 3-5 habits to start your journey
        </Text>
        <Text style={styles.counter}>
          {selectedHabits.length} / 5 selected
        </Text>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {HABIT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Habits list */}
      <ScrollView
        style={styles.habitsContainer}
        contentContainerStyle={styles.habitsContent}
        showsVerticalScrollIndicator={false}
      >
        {categoryHabits.map((habit) => {
          const selected = isHabitSelected(habit);
          return (
            <TouchableOpacity
              key={habit.name}
              style={[styles.habitItem, selected && styles.habitItemSelected]}
              onPress={() => toggleHabit(habit)}
              activeOpacity={0.7}
            >
              <Text style={styles.habitIcon}>{habit.icon}</Text>
              <Text
                style={[styles.habitName, selected && styles.habitNameSelected]}
              >
                {habit.name}
              </Text>
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected habits preview */}
      {selectedHabits.length > 0 && (
        <View style={styles.selectedPreview}>
          <Text style={styles.selectedLabel}>Selected:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectedRow}>
              {selectedHabits.map((habit) => (
                <View key={habit.name} style={styles.selectedChip}>
                  <Text>{habit.icon}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          fullWidth
          size="large"
          disabled={!canProceed}
        />
        {!canProceed && (
          <Text style={styles.hint}>
            {selectedHabits.length < 3
              ? `Select ${3 - selectedHabits.length} more habit${3 - selectedHabits.length > 1 ? 's' : ''}`
              : 'Maximum 5 habits allowed'}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: theme.textSecondary,
  },
  counter: {
    ...typography.label,
    color: theme.primary,
    marginTop: spacing.sm,
  },
  categoriesContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: theme.surface,
    marginRight: spacing.sm,
    ...shadows.sm,
  },
  categoryTabActive: {
    backgroundColor: theme.primary,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  categoryName: {
    ...typography.label,
    color: theme.text,
  },
  categoryNameActive: {
    color: theme.surface,
  },
  habitsContainer: {
    flex: 1,
  },
  habitsContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  habitItemSelected: {
    backgroundColor: theme.surfaceSecondary,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  habitIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  habitName: {
    ...typography.body,
    color: theme.text,
    flex: 1,
  },
  habitNameSelected: {
    color: theme.text,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedPreview: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  selectedLabel: {
    ...typography.labelSmall,
    color: theme.textSecondary,
    marginBottom: spacing.sm,
  },
  selectedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  selectedChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
