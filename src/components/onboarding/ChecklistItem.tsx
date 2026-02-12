import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme, spacing, borderRadius } from '../../theme';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

export function ChecklistItem({ label, checked, onPress }: ChecklistItemProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        checked && styles.containerChecked,
        pressed && styles.containerPressed,
      ]}
      onPress={handlePress}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 164, 200, 0.2)',
  },
  containerChecked: {
    backgroundColor: 'rgba(232, 164, 200, 0.15)',
    borderColor: theme.primary,
  },
  containerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(232, 164, 200, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.text,
    lineHeight: 20,
  },
  labelChecked: {
    color: theme.text,
  },
});
