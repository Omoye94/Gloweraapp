import React, { useMemo } from 'react';
import { G, Path, Circle } from 'react-native-svg';

interface WaterDropsProps {
  centerX: number;
  topY: number;
  baseY: number;
}

export const WaterDrops: React.FC<WaterDropsProps> = ({
  centerX,
  topY,
  baseY,
}) => {
  const drops = useMemo(() => {
    const count = 3 + Math.floor(Math.random() * 3);
    return Array.from({ length: count }).map((_, i) => {
      const x = centerX + (Math.random() - 0.5) * 60;
      const startY = topY - 10 - Math.random() * 20;
      const endY = baseY - 5 + Math.random() * 8;
      const midY = (startY + endY) / 2;
      return { x, startY, midY, endY, size: 2 + Math.random() * 2 };
    });
  }, [centerX, topY, baseY]);

  return (
    <G>
      {drops.map((drop, i) => (
        <G key={`water-${i}`}>
          <Path
            d={`M ${drop.x} ${drop.midY - drop.size * 1.5} Q ${drop.x + drop.size * 0.5} ${drop.midY} ${drop.x} ${drop.midY + drop.size * 0.5} Q ${drop.x - drop.size * 0.5} ${drop.midY} ${drop.x} ${drop.midY - drop.size * 1.5} Z`}
            fill="#7BB8E0"
            opacity={0.6}
          />
          <Circle
            cx={drop.x}
            cy={drop.endY}
            r={drop.size * 1.5}
            fill="none"
            stroke="#7BB8E0"
            strokeWidth={0.5}
            opacity={0.3}
          />
        </G>
      ))}
    </G>
  );
};
