import React, { useMemo } from 'react';
import { G } from 'react-native-svg';
import { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { AnimatedG, AnimatedCircle, AnimatedPath } from './AnimatedSvg';
import { StageColors } from './treeColors';

interface TreeParticlesProps {
  centerX: number;
  centerY: number;
  radius: number;
  count: number;
  types: ('sparkle' | 'petal' | 'firefly' | 'water' | 'soil')[];
  colors: StageColors;
  particleColor?: string;
  particleAltColor?: string;
  particleDriftY?: SharedValue<number>;
  particleDriftX?: SharedValue<number>;
  particleFade?: SharedValue<number>;
}

// Individual animated particle wrapper
const AnimatedParticle: React.FC<{
  index: number;
  children: React.ReactNode;
  particleDriftY?: SharedValue<number>;
  particleDriftX?: SharedValue<number>;
}> = ({ index, children, particleDriftY, particleDriftX }) => {
  const animProps = useAnimatedProps(() => {
    const dy = particleDriftY ? particleDriftY.value * (0.5 + (index % 5) * 0.1) : 0;
    const dx = particleDriftX ? particleDriftX.value * (index % 2 === 0 ? 1 : -1) : 0;
    return {
      transform: [{ translateX: dx }, { translateY: dy }],
    } as any;
  });

  if (!particleDriftY && !particleDriftX) {
    return <G>{children}</G>;
  }

  return <AnimatedG animatedProps={animProps}>{children}</AnimatedG>;
};

// Animated sparkle with opacity twinkle
const AnimatedSparkle: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  baseOpacity: number;
  particleFade?: SharedValue<number>;
}> = ({ x, y, size, color, baseOpacity, particleFade }) => {
  const vProps = useAnimatedProps(() => ({
    opacity: baseOpacity * (0.6 + (particleFade ? particleFade.value : 0.5) * 0.4),
  }));
  const hProps = useAnimatedProps(() => ({
    opacity: baseOpacity * 0.7 * (0.6 + (particleFade ? particleFade.value : 0.5) * 0.4),
  }));

  return (
    <G>
      <AnimatedPath
        d={`M ${x} ${y - size} L ${x + size * 0.3} ${y} L ${x} ${y + size} L ${x - size * 0.3} ${y} Z`}
        fill={color}
        animatedProps={vProps}
      />
      <AnimatedPath
        d={`M ${x - size} ${y} L ${x} ${y + size * 0.3} L ${x + size} ${y} L ${x} ${y - size * 0.3} Z`}
        fill={color}
        animatedProps={hProps}
      />
    </G>
  );
};

// Animated firefly with faster blink
const AnimatedFirefly: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  baseOpacity: number;
  particleFade?: SharedValue<number>;
}> = ({ x, y, size, color, baseOpacity, particleFade }) => {
  const outerProps = useAnimatedProps(() => ({
    opacity: baseOpacity * 0.3 * (0.4 + (particleFade ? particleFade.value : 0.5) * 0.6),
  }));
  const innerProps = useAnimatedProps(() => ({
    opacity: baseOpacity * (0.5 + (particleFade ? particleFade.value : 0.5) * 0.5),
  }));

  return (
    <G>
      <AnimatedCircle cx={x} cy={y} r={size * 1.5} fill={color} animatedProps={outerProps} />
      <AnimatedCircle cx={x} cy={y} r={size * 0.5} fill={color} animatedProps={innerProps} />
    </G>
  );
};

// Animated petal
const AnimatedPetal: React.FC<{
  x: number;
  y: number;
  size: number;
  flowerColor: string;
  baseOpacity: number;
  particleFade?: SharedValue<number>;
}> = ({ x, y, size, flowerColor, baseOpacity, particleFade }) => {
  const animProps = useAnimatedProps(() => ({
    opacity: baseOpacity * (0.6 + (particleFade ? particleFade.value : 0.5) * 0.4),
  }));

  return (
    <AnimatedPath
      d={`M ${x} ${y} Q ${x + size} ${y - size} ${x + size * 2} ${y} Q ${x + size} ${y + size * 0.5} ${x} ${y} Z`}
      fill={flowerColor}
      animatedProps={animProps}
    />
  );
};

// Animated water drop
const AnimatedWaterDrop: React.FC<{
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  particleFade?: SharedValue<number>;
}> = ({ x, y, size, baseOpacity, particleFade }) => {
  const animProps = useAnimatedProps(() => ({
    opacity: baseOpacity * 0.6 * (0.7 + (particleFade ? particleFade.value : 0.5) * 0.3),
  }));

  return (
    <AnimatedPath
      d={`M ${x} ${y - size * 1.5} Q ${x + size * 0.5} ${y} ${x} ${y + size * 0.5} Q ${x - size * 0.5} ${y} ${x} ${y - size * 1.5} Z`}
      fill="#7BB8E0"
      animatedProps={animProps}
    />
  );
};

// Static soil particle
const SoilParticle: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}> = ({ x, y, size, color, opacity }) => (
  <AnimatedCircle cx={x} cy={y} r={size * 0.6} fill={color} opacity={opacity * 0.4} />
);

export const TreeParticles: React.FC<TreeParticlesProps> = ({
  centerX,
  centerY,
  radius,
  count,
  types,
  colors,
  particleColor,
  particleAltColor,
  particleDriftY,
  particleDriftX,
  particleFade,
}) => {
  const pColor = particleColor || colors.particle;
  const pAltColor = particleAltColor || colors.particleAlt;

  const particles = useMemo(() => {
    const pts: { x: number; y: number; type: string; size: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i * 137.508 + 30) * (Math.PI / 180);
      const r = radius * (0.4 + 0.6 * ((i + 1) / count));
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r * 0.8;
      const type = types[i % types.length];
      const size = 1.5 + (i % 3);
      pts.push({ x, y, type, size });
    }
    return pts;
  }, [centerX, centerY, radius, count, types]);

  return (
    <G>
      {particles.map((p, i) => {
        const color = i % 2 === 0 ? pColor : pAltColor;
        const opacity = 0.4 + (i % 3) * 0.2;

        const inner = (() => {
          switch (p.type) {
            case 'sparkle':
              return (
                <AnimatedSparkle
                  x={p.x}
                  y={p.y}
                  size={p.size}
                  color={color}
                  baseOpacity={opacity}
                  particleFade={particleFade}
                />
              );
            case 'petal':
              return (
                <AnimatedPetal
                  x={p.x}
                  y={p.y}
                  size={p.size}
                  flowerColor={colors.flower}
                  baseOpacity={opacity}
                  particleFade={particleFade}
                />
              );
            case 'firefly':
              return (
                <AnimatedFirefly
                  x={p.x}
                  y={p.y}
                  size={p.size}
                  color={color}
                  baseOpacity={opacity}
                  particleFade={particleFade}
                />
              );
            case 'water':
              return (
                <AnimatedWaterDrop
                  x={p.x}
                  y={p.y}
                  size={p.size}
                  baseOpacity={opacity}
                  particleFade={particleFade}
                />
              );
            case 'soil':
              return (
                <SoilParticle
                  x={p.x}
                  y={p.y}
                  size={p.size}
                  color={colors.soilDark}
                  opacity={opacity}
                />
              );
            default:
              return null;
          }
        })();

        return (
          <AnimatedParticle
            key={`p-${i}`}
            index={i}
            particleDriftY={particleDriftY}
            particleDriftX={particleDriftX}
          >
            {inner}
          </AnimatedParticle>
        );
      })}
    </G>
  );
};
