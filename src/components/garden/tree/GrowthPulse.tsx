import React, { useEffect, useRef } from 'react';
import { G, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { AnimatedCircle } from './AnimatedSvg';

interface GrowthPulseProps {
  centerX: number;
  centerY: number;
  pointsTimestamp: number;
}

const SPARKLE_COUNT = 4;
const GOLDEN_ANGLE = 137.508;

const SparkleParticle: React.FC<{
  cx: number;
  cy: number;
  angle: number;
  delay: number;
}> = ({ cx, cy, angle, delay }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
  }, []);

  const rad = (angle * Math.PI) / 180;

  const animProps = useAnimatedProps(() => {
    const dist = progress.value * 25;
    return {
      cx: cx + Math.cos(rad) * dist,
      cy: cy + Math.sin(rad) * dist,
      r: 2.5 * (1 - progress.value * 0.6),
      opacity: 1 - progress.value,
    };
  });

  return <AnimatedCircle fill="#F5D998" animatedProps={animProps} />;
};

export const GrowthPulse: React.FC<GrowthPulseProps> = ({
  centerX,
  centerY,
  pointsTimestamp,
}) => {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);
  const lastTimestamp = useRef(0);
  const [showSparkles, setShowSparkles] = React.useState(false);

  useEffect(() => {
    if (!pointsTimestamp || pointsTimestamp === lastTimestamp.current) return;
    lastTimestamp.current = pointsTimestamp;

    pulseScale.value = 1;
    pulseOpacity.value = 0;

    pulseScale.value = withSequence(
      withTiming(1.05, { duration: 300, easing: Easing.out(Easing.ease) }),
      withTiming(1.0, { duration: 300, easing: Easing.inOut(Easing.ease) }),
    );

    pulseOpacity.value = withSequence(
      withTiming(0.3, { duration: 200 }),
      withTiming(0, { duration: 600 }),
    );

    setShowSparkles(true);
    const t = setTimeout(() => setShowSparkles(false), 900);
    return () => clearTimeout(t);
  }, [pointsTimestamp]);

  const ringProps = useAnimatedProps(() => ({
    r: 30 * pulseScale.value,
    opacity: pulseOpacity.value,
  }));

  return (
    <G>
      <AnimatedCircle
        cx={centerX}
        cy={centerY}
        fill="#F5D998"
        animatedProps={ringProps}
      />
      {showSparkles &&
        Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
          <SparkleParticle
            key={`sparkle-${pointsTimestamp}-${i}`}
            cx={centerX}
            cy={centerY}
            angle={i * GOLDEN_ANGLE}
            delay={i * 80}
          />
        ))}
    </G>
  );
};
