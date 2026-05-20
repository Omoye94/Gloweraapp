// SVG path generation helpers for the tree

// Generate trunk path with slight curve
// baseX, baseY = bottom center of trunk
export function generateTrunkPath(
  baseX: number,
  baseY: number,
  height: number,
  width: number,
  curve: number
): string {
  const topY = baseY - height;
  const halfW = width / 2;

  // Left side going up
  const leftX = baseX - halfW;
  const rightX = baseX + halfW;
  const cpX = baseX + curve; // slight lean

  return [
    `M ${leftX} ${baseY}`,
    `Q ${cpX - halfW} ${baseY - height * 0.6} ${leftX + 1} ${topY}`,
    `L ${rightX - 1} ${topY}`,
    `Q ${cpX + halfW} ${baseY - height * 0.6} ${rightX} ${baseY}`,
    'Z',
  ].join(' ');
}

// Generate a branch path from a point on the trunk
export function generateBranchPath(
  startX: number,
  startY: number,
  length: number,
  angle: number, // degrees from vertical, positive = right
  thickness: number
): string {
  const rad = (angle * Math.PI) / 180;
  const endX = startX + Math.sin(rad) * length;
  const endY = startY - Math.cos(rad) * length * 0.3; // branches go slightly up

  const cpX = startX + Math.sin(rad) * length * 0.6;
  const cpY = startY - Math.cos(rad) * length * 0.15;

  const halfT = thickness / 2;
  const perpX = Math.cos(rad) * halfT;
  const perpY = Math.sin(rad) * halfT;

  return [
    `M ${startX - perpX} ${startY - perpY}`,
    `Q ${cpX} ${cpY} ${endX} ${endY - halfT * 0.5}`,
    `L ${endX} ${endY + halfT * 0.5}`,
    `Q ${cpX} ${cpY + halfT} ${startX + perpX} ${startY + perpY}`,
    'Z',
  ].join(' ');
}

// Generate root paths at base of tree
export function generateRootPaths(
  baseX: number,
  baseY: number,
  trunkWidth: number
): string[] {
  const halfW = trunkWidth / 2;
  const roots: string[] = [];

  // Left root
  roots.push(
    `M ${baseX - halfW} ${baseY} Q ${baseX - halfW - 12} ${baseY + 2} ${baseX - halfW - 18} ${baseY + 5}`
  );
  // Right root
  roots.push(
    `M ${baseX + halfW} ${baseY} Q ${baseX + halfW + 12} ${baseY + 2} ${baseX + halfW + 18} ${baseY + 5}`
  );

  return roots;
}

// Get branch attachment points along the trunk
export function getBranchPoints(
  baseX: number,
  baseY: number,
  trunkHeight: number,
  trunkCurve: number,
  count: number
): { x: number; y: number; side: 'left' | 'right' }[] {
  const points: { x: number; y: number; side: 'left' | 'right' }[] = [];
  if (count === 0) return points;

  // Distribute branches along upper 70% of trunk
  const startFraction = 0.3;
  const endFraction = 0.85;

  for (let i = 0; i < count; i++) {
    const t = startFraction + ((endFraction - startFraction) * i) / Math.max(count - 1, 1);
    const y = baseY - trunkHeight * t;
    // Trunk has a slight curve, offset x accordingly
    const curveOffset = trunkCurve * Math.sin(t * Math.PI) * 0.3;
    const side: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
    const x = baseX + curveOffset;
    points.push({ x, y, side });
  }

  return points;
}

// Generate leaf cluster positions around canopy center
export function getLeafPositions(
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  seed: number = 0
): { x: number; y: number; rotation: number }[] {
  const positions: { x: number; y: number; rotation: number }[] = [];

  for (let i = 0; i < count; i++) {
    // Golden angle distribution for natural look
    const angle = (i * 137.508 + seed * 60) * (Math.PI / 180);
    const r = radius * (0.3 + 0.7 * Math.sqrt((i + 1) / count));
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r * 0.7; // squash vertically for canopy shape
    const rotation = (angle * 180) / Math.PI + (i % 3) * 20;
    positions.push({ x, y, rotation });
  }

  return positions;
}

// Generate flower positions (subset of canopy, more towards top/outside)
export function getFlowerPositions(
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  seed: number = 42
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i * 137.508 + seed * 45) * (Math.PI / 180);
    const r = radius * (0.5 + 0.5 * Math.sqrt((i + 1) / count));
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r * 0.6 - radius * 0.1;
    positions.push({ x, y });
  }

  return positions;
}
