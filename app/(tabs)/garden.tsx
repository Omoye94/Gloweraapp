import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, TrendingUp } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useGardenStore } from '../../stores/gardenStore';
import { colors, PLANT_GROWTH_THRESHOLDS, PLANT_GROWTH_MESSAGES } from '../../lib/constants';
import { PlantGrowthStage } from '../../types';
import Plant from '../../components/garden/Plant';

const stages: PlantGrowthStage[] = ['seed', 'sprout', 'bud', 'bloom', 'glow'];

export default function GardenScreen() {
  const { user } = useAuthStore();
  const {
    plant,
    fetchPlant,
    getProgressPercentage,
    getCurrentStageMessage,
    showGrowthAnimation,
    lastGrowthMessage,
    dismissGrowthAnimation,
  } = useGardenStore();

  useEffect(() => {
    if (user?.id) {
      fetchPlant(user.id);
    }
  }, [user?.id]);

  const progressPercentage = getProgressPercentage();
  const currentMessage = getCurrentStageMessage();

  const getCurrentStageIndex = () => {
    if (!plant) return 0;
    return stages.indexOf(plant.growth_stage);
  };

  const getNextStagePoints = () => {
    if (!plant) return PLANT_GROWTH_THRESHOLDS.sprout;
    const currentIndex = getCurrentStageIndex();
    if (currentIndex >= stages.length - 1) return plant.growth_points;
    const nextStage = stages[currentIndex + 1];
    return PLANT_GROWTH_THRESHOLDS[nextStage];
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Growth Animation Overlay */}
      {showGrowthAnimation && lastGrowthMessage && (
        <TouchableOpacity
          className="absolute inset-0 z-50 bg-black/40 items-center justify-center"
          onPress={dismissGrowthAnimation}
          activeOpacity={1}
        >
          <View className="bg-surface mx-8 p-8 rounded-softer items-center">
            <View className="w-20 h-20 rounded-full bg-accent/30 items-center justify-center mb-4">
              <Sparkles size={40} color={colors.accent} />
            </View>
            <Text className="text-2xl font-bold text-text mb-2">Level Up!</Text>
            <Text className="text-text-light text-center text-lg">
              {lastGrowthMessage}
            </Text>
            <TouchableOpacity
              className="mt-6 bg-primary px-8 py-3 rounded-soft"
              onPress={dismissGrowthAnimation}
            >
              <Text className="text-white font-medium">Continue</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-bold text-text">Glow Garden</Text>
          <Text className="text-text-light mt-1">
            Watch your progress bloom
          </Text>
        </View>

        {/* Plant Display */}
        <View className="items-center py-8">
          <Plant stage={plant?.growth_stage || 'seed'} />
          <Text className="text-xl font-semibold text-text mt-4 capitalize">
            {plant?.growth_stage || 'seed'} Stage
          </Text>
          <Text className="text-text-light mt-1 px-8 text-center">
            {currentMessage}
          </Text>
        </View>

        {/* Progress Card */}
        <View className="mx-6 bg-surface rounded-softer p-5 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <TrendingUp size={20} color={colors.primary} />
              <Text className="text-text font-semibold ml-2">Growth Progress</Text>
            </View>
            <Text className="text-primary font-bold">
              {plant?.growth_points || 0} pts
            </Text>
          </View>

          {/* Progress to next stage */}
          <View className="h-3 bg-primary/10 rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>

          <Text className="text-text-light text-sm">
            {plant?.growth_stage === 'glow'
              ? "You've reached the highest stage!"
              : `${getNextStagePoints() - (plant?.growth_points || 0)} points to next stage`}
          </Text>
        </View>

        {/* Stages Timeline */}
        <View className="mx-6 bg-surface rounded-softer p-5">
          <Text className="text-text font-semibold mb-4">Growth Journey</Text>

          {stages.map((stage, index) => {
            const currentIndex = getCurrentStageIndex();
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            const points = PLANT_GROWTH_THRESHOLDS[stage];

            return (
              <View key={stage} className="flex-row items-start mb-4 last:mb-0">
                {/* Timeline indicator */}
                <View className="items-center mr-4">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isCompleted
                        ? 'bg-primary'
                        : 'bg-primary/20'
                    }`}
                  >
                    {isCompleted && (
                      <Sparkles size={16} color="#FFFFFF" />
                    )}
                  </View>
                  {index < stages.length - 1 && (
                    <View
                      className={`w-0.5 h-8 ${
                        isCompleted ? 'bg-primary' : 'bg-primary/20'
                      }`}
                    />
                  )}
                </View>

                {/* Stage info */}
                <View className="flex-1 pt-1">
                  <View className="flex-row justify-between items-center">
                    <Text
                      className={`font-medium capitalize ${
                        isCurrent ? 'text-primary' : isCompleted ? 'text-text' : 'text-text-light'
                      }`}
                    >
                      {stage}
                      {isCurrent && ' (Current)'}
                    </Text>
                    <Text className="text-text-light text-sm">{points} pts</Text>
                  </View>
                  <Text className="text-text-light text-sm mt-0.5">
                    {PLANT_GROWTH_MESSAGES[stage]}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Tips */}
        <View className="mx-6 mt-6 bg-accent/20 rounded-softer p-5">
          <Text className="text-text font-semibold mb-2">Growing Tips</Text>
          <Text className="text-text-light leading-relaxed">
            • Complete habits gently (+5 pts) or fully (+10 pts){'\n'}
            • Complete all daily habits for a bonus (+25 pts){'\n'}
            • Finish challenges for extra growth (+50 pts){'\n'}
            • Write reflections to nurture your plant (+10 pts)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
