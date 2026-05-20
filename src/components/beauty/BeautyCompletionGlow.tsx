import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { borderRadius } from '../../theme';

interface BeautyCompletionGlowProps {
  visible: boolean;
}

export const BeautyCompletionGlow: React.FC<BeautyCompletionGlowProps> = ({ visible }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.glow, { opacity }]}
    />
  );
};

const styles = StyleSheet.create({
  glow: {
    backgroundColor: 'rgba(212, 144, 154, 0.4)',
    borderRadius: borderRadius.xl,
  },
});
