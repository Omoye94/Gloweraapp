import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';

type ColorVariant = 'blush' | 'lavender' | 'gold';

interface GlowSpiritProps {
  visible: boolean;
  colorVariant?: ColorVariant;
}

const VARIANT_COLORS: Record<ColorVariant, { orb: string; ring: string; outer: string }> = {
  blush:   { orb: '#F2B4CC', ring: 'rgba(244,198,204,0.45)', outer: 'rgba(244,198,204,0.18)' },
  lavender:{ orb: '#D8CFEA', ring: 'rgba(216,207,234,0.45)', outer: 'rgba(216,207,234,0.18)' },
  gold:    { orb: '#F6E3B4', ring: 'rgba(246,227,180,0.45)', outer: 'rgba(246,227,180,0.18)' },
};

const AFFIRMATIONS = [
  'Your garden grew today.',
  'Small rituals create change.',
  'You showed up for yourself.',
];

export const GlowSpirit = React.memo(function GlowSpirit({
  visible,
  colorVariant = 'blush',
}: GlowSpiritProps) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.6)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const triggerCountRef = useRef(0);
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);

  useEffect(() => {
    if (!visible) return;

    // Pick next affirmation
    const idx = triggerCountRef.current % AFFIRMATIONS.length;
    setAffirmation(AFFIRMATIONS[idx]);
    triggerCountRef.current += 1;

    // Reset values
    opacity.setValue(0);
    translateY.setValue(0);
    scale.setValue(0.6);
    textOpacity.setValue(0);

    // Phase 1: fade in + expand (600ms)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Phase 2: float up + fade out (900ms)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]).start();
    });
  }, [visible]);

  const colors = VARIANT_COLORS[colorVariant];

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
      pointerEvents="none"
    >
      {/* Outer diffuse ring */}
      <View style={[styles.outerRing, { backgroundColor: colors.outer }]} />
      {/* Mid ring */}
      <View style={[styles.midRing, { backgroundColor: colors.ring }]} />
      {/* Core orb */}
      <View style={[styles.coreOrb, { backgroundColor: colors.orb }]} />

      {/* Affirmation text */}
      <Animated.Text style={[styles.affirmationText, { opacity: textOpacity }]}>
        {affirmation}
      </Animated.Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 70,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  outerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  midRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  coreOrb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  affirmationText: {
    marginTop: 52,
    fontSize: 12,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
    color: '#7A6668',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
