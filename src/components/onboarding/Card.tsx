import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: 'rgba(232, 164, 200, 0.15)',
  },
});
