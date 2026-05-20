import { View, Text } from 'react-native';
import { PlantGrowthStage } from '../../types';

interface PlantProps {
  stage: PlantGrowthStage;
}

const plantEmojis: Record<PlantGrowthStage, string> = {
  seed: '🌱',
  sprout: '🌿',
  bud: '🌷',
  bloom: '🌸',
  glow: '🌺',
};

const plantSizes: Record<PlantGrowthStage, number> = {
  seed: 60,
  sprout: 80,
  bud: 100,
  bloom: 120,
  glow: 140,
};

const glowColors: Record<PlantGrowthStage, string> = {
  seed: '#D4E8B4',
  sprout: '#B4E8C7',
  bud: '#E8C4B8',
  bloom: '#E8D4B4',
  glow: '#FFE4C7',
};

export default function Plant({ stage }: PlantProps) {
  const size = plantSizes[stage];
  const emoji = plantEmojis[stage];
  const glowColor = glowColors[stage];

  return (
    <View className="items-center justify-center">
      {/* Outer glow rings */}
      {stage === 'glow' && (
        <>
          <View
            className="absolute rounded-full opacity-20"
            style={{
              width: size + 80,
              height: size + 80,
              backgroundColor: glowColor,
            }}
          />
          <View
            className="absolute rounded-full opacity-30"
            style={{
              width: size + 50,
              height: size + 50,
              backgroundColor: glowColor,
            }}
          />
        </>
      )}

      {/* Inner glow */}
      <View
        className="rounded-full items-center justify-center"
        style={{
          width: size + 30,
          height: size + 30,
          backgroundColor: `${glowColor}40`,
        }}
      >
        {/* Plant container */}
        <View
          className="rounded-full items-center justify-center"
          style={{
            width: size,
            height: size,
            backgroundColor: `${glowColor}60`,
          }}
        >
          <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
        </View>
      </View>

      {/* Sparkle decorations for bloom and glow stages */}
      {(stage === 'bloom' || stage === 'glow') && (
        <>
          <View
            className="absolute"
            style={{
              top: 10,
              right: size / 3,
            }}
          >
            <Text style={{ fontSize: 16 }}>✨</Text>
          </View>
          <View
            className="absolute"
            style={{
              bottom: 20,
              left: size / 4,
            }}
          >
            <Text style={{ fontSize: 14 }}>✨</Text>
          </View>
        </>
      )}

      {stage === 'glow' && (
        <View
          className="absolute"
          style={{
            top: size / 3,
            left: 0,
          }}
        >
          <Text style={{ fontSize: 12 }}>✨</Text>
        </View>
      )}
    </View>
  );
}
