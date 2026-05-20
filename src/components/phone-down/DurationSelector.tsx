import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const PRESETS = [5, 10, 15, 30] as const;
const DEFAULT_CUSTOM = 20;
const MIN_CUSTOM = 1;
const MAX_CUSTOM = 120;

interface DurationSelectorProps {
  selected: number;
  onSelect: (minutes: number) => void;
}

function isPreset(v: number): boolean {
  return (PRESETS as readonly number[]).includes(v);
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({ selected, onSelect }) => {
  // Track the custom value independently so the stepper preserves its state
  const [customValue, setCustomValue] = useState(() =>
    isPreset(selected) ? DEFAULT_CUSTOM : selected
  );

  const customActive = !isPreset(selected);

  const handleCustomTap = () => {
    onSelect(customValue);
  };

  const adjustCustom = (delta: number) => {
    const next = Math.min(MAX_CUSTOM, Math.max(MIN_CUSTOM, customValue + delta));
    setCustomValue(next);
    onSelect(next);
  };

  return (
    <View style={styles.container}>
      {/* Preset pills */}
      <View style={styles.row}>
        {PRESETS.map((min) => {
          const active = selected === min;
          return (
            <Pressable
              key={min}
              onPress={() => onSelect(min)}
              style={({ pressed }) => [
                styles.option,
                active && styles.optionActive,
                pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
              ]}
            >
              <Text style={[styles.value, active && styles.valueActive]}>{min}</Text>
              <Text style={[styles.unit, active && styles.unitActive]}>min</Text>
            </Pressable>
          );
        })}

        {/* Custom pill */}
        <Pressable
          onPress={handleCustomTap}
          style={({ pressed }) => [
            styles.option,
            styles.optionCustom,
            customActive && styles.optionActive,
            pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
          ]}
        >
          <Text style={[styles.value, styles.valueCustomBase, customActive && styles.valueActive]}>
            {customActive ? customValue : '···'}
          </Text>
          <Text style={[styles.unit, customActive && styles.unitActive]}>custom</Text>
        </Pressable>
      </View>

      {/* Stepper — shown when custom is active */}
      {customActive && (
        <View style={styles.stepper}>
          <Pressable
            onPress={() => adjustCustom(-1)}
            onLongPress={() => adjustCustom(-5)}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>

          <View style={styles.stepDisplay}>
            <Text style={styles.stepValue}>{customValue}</Text>
            <Text style={styles.stepUnit}>minutes</Text>
          </View>

          <Pressable
            onPress={() => adjustCustom(1)}
            onLongPress={() => adjustCustom(5)}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>
      )}

      {customActive && (
        <Text style={styles.stepHint}>Hold − or + to change by 5</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  option: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(254,250,249,0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,144,154,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCustom: {
    width: 72,
  },
  optionActive: {
    backgroundColor: '#FEFAF9',
    borderColor: '#C45A82',
    shadowColor: '#C45A82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  value: {
    fontSize: 20,
    fontFamily: 'Raleway-SemiBold',
    color: 'rgba(42,28,30,0.4)',
  },
  valueCustomBase: {
    fontSize: 16,
  },
  valueActive: {
    color: '#C45A82',
  },
  unit: {
    fontSize: 9,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: 'rgba(42,28,30,0.35)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  unitActive: {
    color: '#C45A82',
    opacity: 0.7,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254,250,249,0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,144,154,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(212,144,154,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 22,
    color: '#C45A82',
    fontFamily: 'Raleway-SemiBold',
    lineHeight: 26,
  },
  stepDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  stepValue: {
    fontSize: 28,
    fontFamily: 'Raleway-SemiBold',
    color: '#3A2E2B',
    letterSpacing: -0.5,
  },
  stepUnit: {
    fontSize: 10,
    fontFamily: 'DMSans',
    fontWeight: '700',
    color: '#9E8880',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepHint: {
    fontSize: 11,
    fontFamily: 'DMSans',
    color: '#B8A09C',
    textAlign: 'center',
  },
});
