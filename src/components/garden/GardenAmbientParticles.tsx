import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { GrowthStage } from '../../types/plant';

const PARTICLE_COLORS = ['#F2B4CC', '#9B86D4', '#F6E3B4', '#8FA886'];

const STAGE_PARTICLE_COUNT: Record<GrowthStage, number> = {
  seed: 1,
  sprout: 2,
  bud: 2,
  bloom: 3,
  glow: 4,
};

interface ParticleConfig {
  id: number;
  color: string;
  size: number;
  x: number;
  duration: number;
  delay: number;
  driftX: number;
}

function SingleParticle({ config }: { config: ParticleConfig }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(-44, { duration: config.duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );

    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.28, { duration: config.duration * 0.3, easing: Easing.in(Easing.ease) }),
          withTiming(0.22, { duration: config.duration * 0.4 }),
          withTiming(0, { duration: config.duration * 0.3, easing: Easing.out(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );

    translateX.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(config.driftX, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
          left: config.x,
        },
        style,
      ]}
    />
  );
}

interface GardenAmbientParticlesProps {
  stage: GrowthStage;
}

export const GardenAmbientParticles = React.memo(function GardenAmbientParticles({
  stage,
}: GardenAmbientParticlesProps) {
  const count = STAGE_PARTICLE_COUNT[stage];

  const particles = useMemo<ParticleConfig[]>(() => {
    const positions = [-55, -20, 15, 50];
    const drifts = [6, -8, 8, -6];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      size: 4 + (i % 2) * 2,
      x: positions[i] + 130, // offset from left edge of 280px card
      duration: 5500 + i * 700,
      delay: i * 1200,
      driftX: drifts[i] ?? 5,
    }));
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map(p => (
        <SingleParticle key={p.id} config={p} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    bottom: 40,
  },
});
