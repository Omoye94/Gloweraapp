import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface GardenEnergyProps {
  children: React.ReactNode;
  /** 0–1 intensity scales the breathing amplitude. Higher stage = more visible. */
  intensity?: number;
}

export const GardenEnergy = React.memo(function GardenEnergy({
  children,
  intensity = 0.5,
}: GardenEnergyProps) {
  const scale = useSharedValue(1);
  // Max delta: 0.018 at full intensity, scales down for early stages
  const maxDelta = 0.018 * Math.max(0.15, intensity);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1 + maxDelta, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, [intensity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
});
