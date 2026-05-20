import React from 'react';
import { G, Path } from 'react-native-svg';
import { generateTrunkPath, generateRootPaths } from './treePaths';
import { StageColors } from './treeColors';

interface TreeTrunkProps {
  baseX: number;
  baseY: number;
  height: number;
  width: number;
  curve: number;
  colors: StageColors;
}

export const TreeTrunk: React.FC<TreeTrunkProps> = ({
  baseX,
  baseY,
  height,
  width,
  curve,
  colors,
}) => {
  if (height <= 0) return null;

  const trunkPath = generateTrunkPath(baseX, baseY, height, width, curve);
  const rootPaths = generateRootPaths(baseX, baseY, width);

  return (
    <G>
      <Path
        d={trunkPath}
        fill={colors.trunkDark}
        opacity={0.3}
        x={1}
        y={1}
      />
      <Path d={trunkPath} fill={colors.trunk} />
      <Path
        d={generateTrunkPath(baseX - 1, baseY, height - 2, width * 0.3, curve * 0.8)}
        fill={colors.trunk}
        opacity={0.4}
      />
      {width >= 6 &&
        rootPaths.map((rp, i) => (
          <Path
            key={`root-${i}`}
            d={rp}
            stroke={colors.trunk}
            strokeWidth={Math.max(1.5, width * 0.2)}
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
        ))}
    </G>
  );
};
