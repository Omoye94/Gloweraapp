import React from 'react';
import { G, Ellipse, Circle } from 'react-native-svg';
import { useAnimatedProps, SharedValue } from 'react-native-reanimated';
import { AnimatedG } from './AnimatedSvg';
import { getLeafPositions, getFlowerPositions } from './treePaths';
import { StageColors } from './treeColors';

interface TreeCanopyProps {
  centerX: number;
  centerY: number;
  canopyRadius: number;
  leafCount: number;
  leafSize: number;
  flowerCount: number;
  flowerSize: number;
  flowerOpenness: number;
  colors: StageColors;
  swayRotation?: SharedValue<number>;
}

// Animated leaf group that sways
const AnimatedLeaf: React.FC<{
  pos: { x: number; y: number; rotation: number };
  leafSize: number;
  colorVariant: string;
  lightColor: string;
  index: number;
  swayRotation?: SharedValue<number>;
}> = ({ pos, leafSize, colorVariant, lightColor, index, swayRotation }) => {
  const animProps = useAnimatedProps(() => {
    const sway = swayRotation
      ? swayRotation.value * (index % 2 === 0 ? 1 : -0.7)
      : 0;
    return {
      rotation: pos.rotation + sway,
    } as any;
  });

  if (!swayRotation) {
    return (
      <G>
        <Ellipse
          cx={pos.x}
          cy={pos.y}
          rx={leafSize * 0.5}
          ry={leafSize * 0.8}
          fill={colorVariant}
          rotation={pos.rotation}
          origin={`${pos.x}, ${pos.y}`}
        />
        <Ellipse
          cx={pos.x}
          cy={pos.y}
          rx={leafSize * 0.2}
          ry={leafSize * 0.6}
          fill={lightColor}
          opacity={0.4}
          rotation={pos.rotation}
          origin={`${pos.x}, ${pos.y}`}
        />
      </G>
    );
  }

  return (
    <AnimatedG animatedProps={animProps} origin={`${pos.x}, ${pos.y}`}>
      <Ellipse
        cx={pos.x}
        cy={pos.y}
        rx={leafSize * 0.5}
        ry={leafSize * 0.8}
        fill={colorVariant}
      />
      <Ellipse
        cx={pos.x}
        cy={pos.y}
        rx={leafSize * 0.2}
        ry={leafSize * 0.6}
        fill={lightColor}
        opacity={0.4}
      />
    </AnimatedG>
  );
};

export const TreeCanopy: React.FC<TreeCanopyProps> = ({
  centerX,
  centerY,
  canopyRadius,
  leafCount,
  leafSize,
  flowerCount,
  flowerSize,
  flowerOpenness,
  colors,
  swayRotation,
}) => {
  if (leafCount <= 0 && flowerCount <= 0) return null;

  const leafPositions = getLeafPositions(centerX, centerY, canopyRadius, leafCount);
  const flowerPositions = getFlowerPositions(centerX, centerY, canopyRadius, flowerCount);

  return (
    <G>
      {/* Canopy shadow */}
      <Ellipse
        cx={centerX + 2}
        cy={centerY + 2}
        rx={canopyRadius * 0.9}
        ry={canopyRadius * 0.65}
        fill={colors.leafDark}
        opacity={0.1}
      />

      {/* Leaves */}
      {leafPositions.map((pos, i) => {
        const colorVariant = i % 3 === 0 ? colors.leafLight : i % 3 === 1 ? colors.leaf : colors.leafDark;
        return (
          <AnimatedLeaf
            key={`leaf-${i}`}
            pos={pos}
            leafSize={leafSize}
            colorVariant={colorVariant}
            lightColor={colors.leafLight}
            index={i}
            swayRotation={swayRotation}
          />
        );
      })}

      {/* Flowers */}
      {flowerPositions.map((pos, i) => {
        if (flowerOpenness < 0.1) {
          return (
            <Ellipse
              key={`flower-${i}`}
              cx={pos.x}
              cy={pos.y}
              rx={flowerSize * 0.15}
              ry={flowerSize * 0.25}
              fill={colors.flower}
              opacity={0.8}
            />
          );
        }

        const petalSize = flowerSize * 0.4 * flowerOpenness;
        const centerSize = flowerSize * 0.2;
        const petalCount = 5;

        return (
          <G key={`flower-${i}`}>
            {Array.from({ length: petalCount }).map((_, j) => {
              const angle = (j * 360) / petalCount;
              const rad = (angle * Math.PI) / 180;
              const px = pos.x + Math.cos(rad) * petalSize * 0.8;
              const py = pos.y + Math.sin(rad) * petalSize * 0.8;
              return (
                <Ellipse
                  key={`petal-${j}`}
                  cx={px}
                  cy={py}
                  rx={petalSize * 0.6}
                  ry={petalSize * 0.8}
                  fill={colors.flower}
                  opacity={0.7 + flowerOpenness * 0.3}
                  rotation={angle}
                  origin={`${px}, ${py}`}
                />
              );
            })}
            <Circle
              cx={pos.x}
              cy={pos.y}
              r={centerSize}
              fill={colors.flowerCenter}
              opacity={0.9}
            />
          </G>
        );
      })}
    </G>
  );
};
