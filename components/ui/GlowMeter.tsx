import { View, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../../lib/constants';

interface GlowMeterProps {
  percentage: number;
  completedCount: number;
  totalCount: number;
}

export default function GlowMeter({ percentage, completedCount, totalCount }: GlowMeterProps) {
  const getMessage = () => {
    if (totalCount === 0) return "Add habits to start glowing";
    if (percentage === 0) return "Your glow awaits";
    if (percentage < 50) return "Your glow is building";
    if (percentage < 100) return "Almost there, beautiful";
    return "You're glowing today!";
  };

  return (
    <View className="bg-surface rounded-softer p-5">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Sparkles size={20} color={colors.primary} />
          <Text className="text-text font-semibold ml-2">Glow Meter</Text>
        </View>
        <Text className="text-primary font-bold text-lg">{percentage}%</Text>
      </View>

      {/* Progress Bar */}
      <View className="h-3 bg-primary/10 rounded-full overflow-hidden mb-3">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="text-text-light">{getMessage()}</Text>
        <Text className="text-text-light">
          {completedCount}/{totalCount} completed
        </Text>
      </View>
    </View>
  );
}
