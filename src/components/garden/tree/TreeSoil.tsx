import React from 'react';
import { G, Path, Circle } from 'react-native-svg';
import { StageColors } from './treeColors';

interface TreeSoilProps {
  baseY: number;
  centerX: number;
  moundHeight: number;
  colors: StageColors;
  width: number;
}

export const TreeSoil: React.FC<TreeSoilProps> = ({
  baseY,
  centerX,
  moundHeight,
  colors,
  width,
}) => {
  const halfW = width / 2;

  const moundPath = [
    `M ${centerX - halfW} ${baseY + 2}`,
    `Q ${centerX - halfW * 0.5} ${baseY - moundHeight} ${centerX} ${baseY - moundHeight}`,
    `Q ${centerX + halfW * 0.5} ${baseY - moundHeight} ${centerX + halfW} ${baseY + 2}`,
    `L ${centerX + halfW} ${baseY + 10}`,
    `L ${centerX - halfW} ${baseY + 10}`,
    'Z',
  ].join(' ');

  return (
    <G>
      <Path
        d={`M 0 ${baseY + 2} L 300 ${baseY + 2} L 300 300 L 0 300 Z`}
        fill={colors.soilLight}
        opacity={0.3}
      />
      <Path
        d={`M 0 ${baseY + 2} L 300 ${baseY + 2}`}
        stroke={colors.soil}
        strokeWidth={1.5}
        opacity={0.4}
      />
      <Path d={moundPath} fill={colors.soil} opacity={0.6} />
      <Circle cx={centerX - 20} cy={baseY + 5} r={1.5} fill={colors.soilDark} opacity={0.3} />
      <Circle cx={centerX + 15} cy={baseY + 6} r={1} fill={colors.soilDark} opacity={0.25} />
      <Circle cx={centerX - 8} cy={baseY + 8} r={1.2} fill={colors.soilDark} opacity={0.2} />
      <Circle cx={centerX + 25} cy={baseY + 4} r={0.8} fill={colors.soilDark} opacity={0.2} />
    </G>
  );
};
