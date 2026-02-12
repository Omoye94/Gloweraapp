import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme, spacing, borderRadius } from '../../theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Chip({ label, selected, onPress, disabled, style }: ChipProps) {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && !disabled && styles.chipPressed,
        disabled && styles.chipDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 4,
    borderRadius: borderRadius.pill,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 164, 200, 0.3)',
  },
  chipSelected: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  chipPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    textAlign: 'center',
  },
  chipTextSelected: {
    color: theme.primary,
    fontWeight: '600',
  },
});
