import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SupplementCategory } from '../../types/supplement';
import { SUPPLEMENT_CATEGORIES } from '../../constants/supplements';
import { theme, spacing, borderRadius } from '../../theme';

interface CategoryFilterBarProps {
  selectedCategory: SupplementCategory | 'all';
  onSelectCategory: (category: SupplementCategory | 'all') => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const allOption = { id: 'all' as const, name: 'All', icon: '✨' };
  const categories = [allOption, ...SUPPLEMENT_CATEGORIES];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <Pressable
            key={category.id}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Text style={styles.chipIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.chipText,
                isSelected && styles.chipTextSelected,
              ]}
            >
              {category.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  chipSelected: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text,
  },
  chipTextSelected: {
    color: theme.textOnPrimary,
  },
});
