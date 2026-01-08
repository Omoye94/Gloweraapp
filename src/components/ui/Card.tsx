import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'soft' | 'warm';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
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
    borderRadius: borderRadius.card,
    overflow: 'hidden',
  },

  // Variants
  default: {
    ...shadows.sm,
    borderWidth: 1,
    borderColor: theme.borderLight,
  },
  elevated: {
    ...shadows.lg,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: theme.border,
    ...shadows.none,
  },
  // New variants for warm aesthetic
  soft: {
    backgroundColor: theme.surfaceSecondary,
    ...shadows.sm,
  },
  warm: {
    backgroundColor: '#FFF9F5',
    ...shadows.warmGlow,
    borderWidth: 1,
    borderColor: 'rgba(255, 177, 153, 0.15)',
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
