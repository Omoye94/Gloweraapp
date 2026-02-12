import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme, spacing, borderRadius } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ title, onPress, disabled, style }: PrimaryButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.primary,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    backgroundColor: 'rgba(232, 164, 200, 0.4)',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});
