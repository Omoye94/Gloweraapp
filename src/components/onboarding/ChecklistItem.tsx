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
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(58,46,43,0.18)',
    gap: 14,
    shadowColor: '#3A2E2B',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  containerChecked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C45A82',
    borderWidth: 3,
    shadowOpacity: 0.32,
    shadowColor: '#C45A82',
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  containerPressed: {
    opacity: 0.88,
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
    borderColor: 'rgba(58,46,43,0.22)',
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
    color: 'rgba(58,46,43,0.65)',
    lineHeight: 20,
  },
  labelChecked: {
    color: '#3A2E2B',
    fontWeight: '600',
  },
  sublabel: {
    fontSize: 9,
    fontFamily: 'SpaceMono-Bold',
    color: 'rgba(58,46,43,0.4)',
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
