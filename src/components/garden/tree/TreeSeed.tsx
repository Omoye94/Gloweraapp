import React from 'react';
import { G, Ellipse, Path } from 'react-native-svg';
import { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { AnimatedCircle } from './AnimatedSvg';
import { StageColors } from './treeColors';

interface TreeSeedProps {
  centerX: number;
  baseY: number;
  sinkDepth: number;
  crackSize: number;
  sproutHeight: number;
  colors: StageColors;
  progress: number;
  breatheScale?: SharedValue<number>;
}

export const TreeSeed: React.FC<TreeSeedProps> = ({
  centerX,
  baseY,
  sinkDepth,
  crackSize,
  sproutHeight,
  colors,
  progress,
  breatheScale,
}) => {
  const seedY = baseY - 14 + sinkDepth * 0.5;
  const seedRx = 12;
  const seedRy = 15;
  const seedOpacity = progress > 90 ? Math.max(0, 1 - (progress - 90) / 10) : 1;

  const pulseProps = useAnimatedProps(() => {
    const scale = breatheScale ? 0.8 + (breatheScale.value - 0.985) / 0.03 * 0.4 + 0.2 : 1;
    const clampedScale = Math.min(1.2, Math.max(0.8, scale));
    return {
      r: seedRx * 1.8 * clampedScale,
      opacity: 0.1 + (clampedScale - 0.8) * 0.375,
    };
  });

  return (
    <G>
      {/* Seed shadow on soil */}
      <Ellipse
        cx={centerX + 2}
        cy={baseY - 2}
        rx={seedRx * 0.8}
        ry={4}
        fill="#000"
        opacity={0.08}
      />

      {/* Main seed body - teardrop shape */}
      <Path
        d={`M ${centerX} ${seedY - seedRy}
            C ${centerX + seedRx * 1.2} ${seedY - seedRy * 0.5}
              ${centerX + seedRx * 1.2} ${seedY + seedRy * 0.5}
              ${centerX} ${seedY + seedRy}
            C ${centerX - seedRx * 1.2} ${seedY + seedRy * 0.5}
              ${centerX - seedRx * 1.2} ${seedY - seedRy * 0.5}
              ${centerX} ${seedY - seedRy}
            Z`}
        fill={colors.seed}
        opacity={seedOpacity}
      />

      {/* Seed inner pattern - darker stripe */}
      <Path
        d={`M ${centerX} ${seedY - seedRy + 3}
            C ${centerX + 3} ${seedY - seedRy * 0.3}
              ${centerX + 3} ${seedY + seedRy * 0.3}
              ${centerX} ${seedY + seedRy - 3}
            C ${centerX - 1} ${seedY + seedRy * 0.3}
              ${centerX - 1} ${seedY - seedRy * 0.3}
              ${centerX} ${seedY - seedRy + 3}
            Z`}
        fill={colors.seedCrack}
        opacity={0.3 * seedOpacity}
      />

      {/* Seed highlight */}
      <Ellipse
        cx={centerX - 3}
        cy={seedY - 4}
        rx={seedRx * 0.3}
        ry={seedRy * 0.35}
        fill="#FFFFFF"
        opacity={0.25 * seedOpacity}
      />

      {/* Animated breathing pulse ring */}
      <AnimatedCircle
        cx={centerX}
        cy={seedY}
        fill="none"
        stroke={colors.soil}
        strokeWidth={0.5}
        animatedProps={pulseProps}
      />

      {/* Crack line */}
      {crackSize > 0.5 && (
        <Path
          d={`M ${centerX - 1} ${seedY - seedRy * 0.5}
              L ${centerX + crackSize * 0.5} ${seedY}
              L ${centerX - crackSize * 0.3} ${seedY + seedRy * 0.4}`}
          stroke={colors.seedCrack}
          strokeWidth={1.2}
          fill="none"
          opacity={Math.min(1, crackSize / 3) * seedOpacity}
          strokeLinecap="round"
        />
      )}

      {/* Water drop decorations at early progress */}
      {progress < 60 && (
        <G>
          <Path
            d={`M ${centerX - 25} ${seedY - 35}
                Q ${centerX - 23} ${seedY - 28} ${centerX - 25} ${seedY - 25}
                Q ${centerX - 27} ${seedY - 28} ${centerX - 25} ${seedY - 35} Z`}
            fill="#7BB8E0"
            opacity={0.35}
          />
          <Path
            d={`M ${centerX + 20} ${seedY - 40}
                Q ${centerX + 22} ${seedY - 33} ${centerX + 20} ${seedY - 30}
                Q ${centerX + 18} ${seedY - 33} ${centerX + 20} ${seedY - 40} Z`}
            fill="#7BB8E0"
            opacity={0.25}
          />
        </G>
      )}

      {/* Tiny sprout emerging */}
      {sproutHeight > 0 && (
        <G>
          {/* Sprout stem */}
          <Path
            d={`M ${centerX} ${seedY - seedRy}
                C ${centerX - 1} ${seedY - seedRy - sproutHeight * 0.5}
                  ${centerX + 1} ${seedY - seedRy - sproutHeight * 0.8}
                  ${centerX} ${seedY - seedRy - sproutHeight}`}
            stroke="#6BAF5B"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            opacity={Math.min(1, sproutHeight / 3)}
          />
          {/* First tiny leaf */}
          {sproutHeight > 3 && (
            <Ellipse
              cx={centerX + 3}
              cy={seedY - seedRy - sproutHeight + 2}
              rx={4}
              ry={2.5}
              fill="#7CAF6B"
              rotation={-30}
              origin={`${centerX + 3}, ${seedY - seedRy - sproutHeight + 2}`}
              opacity={0.8}
            />
          )}
          {sproutHeight > 5 && (
            <Ellipse
              cx={centerX - 3}
              cy={seedY - seedRy - sproutHeight + 4}
              rx={3.5}
              ry={2}
              fill="#9ECB8E"
              rotation={30}
              origin={`${centerX - 3}, ${seedY - seedRy - sproutHeight + 4}`}
              opacity={0.7}
            />
          )}
        </G>
      )}
    </G>
  );
};
