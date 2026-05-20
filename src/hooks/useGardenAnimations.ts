import { useEffect } from 'react';
import {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

export interface GardenAnimations {
  swayRotation: SharedValue<number>;
  breatheScale: SharedValue<number>;
  glowPulse: SharedValue<number>;
  particleDriftY: SharedValue<number>;
  particleDriftX: SharedValue<number>;
  particleFade: SharedValue<number>;
}

const easeInOut = Easing.inOut(Easing.ease);

/**
 * Hook returning Reanimated shared values for idle garden loops.
 * @param intensity 0–1 based on growth stage (seed=0.15, glow=1.0)
 */
export function useGardenAnimations(intensity: number = 1): GardenAnimations {
  const swayRotation = useSharedValue(0);
  const breatheScale = useSharedValue(1);
  const glowPulse = useSharedValue(1);
  const particleDriftY = useSharedValue(0);
  const particleDriftX = useSharedValue(0);
  const particleFade = useSharedValue(0.5);

  useEffect(() => {
    const sway = 3 * intensity; // ±3° at full intensity
    swayRotation.value = withRepeat(
      withSequence(
        withTiming(sway, { duration: 2000, easing: easeInOut }),
        withTiming(-sway, { duration: 2000, easing: easeInOut }),
      ),
      -1,
      true,
    );

    const breathe = 0.015 * intensity;
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1 + breathe, { duration: 2500, easing: easeInOut }),
        withTiming(1 - breathe, { duration: 2500, easing: easeInOut }),
      ),
      -1,
      true,
    );

    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500, easing: easeInOut }),
        withTiming(1.0, { duration: 1500, easing: easeInOut }),
      ),
      -1,
      true,
    );

    const driftY = 3 * intensity;
    particleDriftY.value = withRepeat(
      withSequence(
        withTiming(driftY, { duration: 3000, easing: easeInOut }),
        withTiming(-driftY, { duration: 3000, easing: easeInOut }),
      ),
      -1,
      true,
    );

    const driftX = 2 * intensity;
    particleDriftX.value = withRepeat(
      withSequence(
        withTiming(driftX, { duration: 3000, easing: easeInOut }),
        withTiming(-driftX, { duration: 3000, easing: easeInOut }),
      ),
      -1,
      true,
    );

    particleFade.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2250, easing: easeInOut }),
        withTiming(0.8, { duration: 2250, easing: easeInOut }),
      ),
      -1,
      true,
    );
  }, [intensity]);

  return {
    swayRotation,
    breatheScale,
    glowPulse,
    particleDriftY,
    particleDriftX,
    particleFade,
  };
}
