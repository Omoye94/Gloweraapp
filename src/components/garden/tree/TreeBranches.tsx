import React from 'react';
import { G, Path } from 'react-native-svg';
import { generateBranchPath, getBranchPoints } from './treePaths';
import { StageColors } from './treeColors';

interface TreeBranchesProps {
  baseX: number;
  baseY: number;
  trunkHeight: number;
  trunkWidth: number;
  trunkCurve: number;
  branchCount: number;
  branchLength: number;
  branchAngle: number;
  colors: StageColors;
}

export const TreeBranches: React.FC<TreeBranchesProps> = ({
  baseX,
  baseY,
  trunkHeight,
  trunkWidth,
  trunkCurve,
  branchCount,
  branchLength,
  branchAngle,
  colors,
}) => {
  if (branchCount <= 0 || branchLength <= 0) return null;

  const points = getBranchPoints(baseX, baseY, trunkHeight, trunkCurve, branchCount);
  const thickness = Math.max(1.5, trunkWidth * 0.35);

  return (
    <G>
      {points.map((pt, i) => {
        const angle = pt.side === 'left' ? -branchAngle - i * 5 : branchAngle + i * 5;
        const len = branchLength * (0.7 + 0.3 * Math.sin(i * 1.5));
        const path = generateBranchPath(pt.x, pt.y, len, angle, thickness);

        return (
          <G key={`branch-${i}`}>
            <Path
              d={path}
              fill={colors.trunkDark}
              opacity={0.2}
              x={0.5}
              y={0.5}
            />
            <Path d={path} fill={colors.branch} opacity={0.85} />
          </G>
        );
      })}
    </G>
  );
};
