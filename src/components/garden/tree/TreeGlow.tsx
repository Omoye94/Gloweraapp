import React from 'react';
import { G } from 'react-native-svg';
import { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { AnimatedCircle } from './AnimatedSvg';
import { StageColors } from './treeColors';

interface TreeGlowProps {
  centerX: number;
  centerY: number;
  intensity: number;
  radius: number;
  colors: StageColors;
  glowPulse?: SharedValue<number>;
}

export const TreeGlow: React.FC<TreeGlowProps> = ({
  centerX,
  centerY,
  intensity,
  radius,
  colors,
  glowPulse,
}) => {
  if (intensity <= 0 || radius <= 0) return null;

  const outerProps = useAnimatedProps(() => ({
    opacity: intensity * 0.3 * (glowPulse ? glowPulse.value : 1),
  }));

  const middleProps = useAnimatedProps(() => ({
    opacity: intensity * 0.5 * (glowPulse ? glowPulse.value * 0.9 + 0.1 : 1),
  }));

  const innerProps = useAnimatedProps(() => ({
    opacity: intensity * 0.4 * (glowPulse ? glowPulse.value * 0.85 + 0.15 : 1),
  }));

  return (
    <G>
      <AnimatedCircle
        cx={centerX}
        cy={centerY}
        r={radius * 1.3}
        fill={colors.glowAura}
        animatedProps={outerProps}
      />
      <AnimatedCircle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill={colors.glowAura}
        animatedProps={middleProps}
      />
      <AnimatedCircle
        cx={centerX}
        cy={centerY}
        r={radius * 0.6}
        fill={colors.flowerGlow}
        animatedProps={innerProps}
      />
    </G>
  );
};
