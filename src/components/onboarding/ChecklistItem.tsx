import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  sublabel?: string;
  disabled?: boolean;
}

export function ChecklistItem({ label, checked, onPress, sublabel, disabled }: ChecklistItemProps) {
  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        checked && styles.containerChecked,
        disabled && styles.containerDisabled,
        pressed && !disabled && styles.containerPressed,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
        {sublabel ? (
          <Text style={styles.sublabel}>{sublabel}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.09)',
    gap: 14,
  },
  containerChecked: {
    backgroundColor: 'rgba(232,127,166,0.14)',
    borderColor: 'rgba(232,127,166,0.45)',
  },
  containerPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  containerDisabled: {
    opacity: 0.4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#E87FA6',
    borderColor: '#E87FA6',
  },
  checkmark: {
    color: '#FEFAF9',
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
    fontFamily: 'DMSans',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
  },
  labelChecked: {
    color: '#FEFAF9',
  },
  sublabel: {
    fontSize: 9,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
