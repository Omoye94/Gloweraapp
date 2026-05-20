import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'hero' | 'standard' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  padding = 'medium',
  style,
}) => {
  return (
    <View style={[styles.base, styles[variant], styles[`${padding}Padding`], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },

  // Variants - distinct visual hierarchy
  hero: {
    borderRadius: borderRadius.hero,
    ...shadows.md,
  },
  standard: {
    borderRadius: borderRadius.card,
    ...shadows.sm,
  },
  outlined: {
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.border,
    ...shadows.none,
  },
  flat: {
    borderRadius: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderLight,
    ...shadows.none,
  },

  // Padding
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: spacing.sm,
  },
  mediumPadding: {
    padding: spacing.md,
  },
  largePadding: {
    padding: spacing.lg,
  },
});
