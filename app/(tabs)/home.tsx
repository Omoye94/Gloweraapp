import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useHabitStore } from '../../stores/habitStore';
import { useGardenStore } from '../../stores/gardenStore';
import { useSupplementStore } from '../../stores/supplementStore';
import { getGreeting, colors, COMPLETION_MESSAGES } from '../../lib/constants';
import { calculateGlowMeter, getRandomItem } from '../../lib/utils';
import HabitCard from '../../components/habits/HabitCard';
import CreateHabitModal from '../../components/habits/CreateHabitModal';
import GlowMeter from '../../components/ui/GlowMeter';
import SupplementSection from '../../components/supplements/SupplementSection';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    habits,
    todayCompletions,
    fetchHabits,
    fetchTodayCompletions,
    getTodayHabits,
    isLoading,
  } = useHabitStore();
  const { plant, fetchPlant } = useGardenStore();
  const { fetchSupplements, fetchTodayLogs } = useSupplementStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  const todayHabits = getTodayHabits();
  const completedCount = todayCompletions.length;
  const glowPercentage = calculateGlowMeter(completedCount, todayHabits.length);

  useEffect(() => {
    if (user?.id) {
      fetchHabits(user.id);
      fetchTodayCompletions(user.id);
      fetchPlant(user.id);
      fetchSupplements(user.id);
      fetchTodayLogs(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await Promise.all([
      fetchHabits(user.id),
      fetchTodayCompletions(user.id),
      fetchPlant(user.id),
      fetchSupplements(user.id),
      fetchTodayLogs(user.id),
    ]);
    setRefreshing(false);
  };

  const handleHabitComplete = (message: string) => {
    setCompletionMessage(message);
    setTimeout(() => setCompletionMessage(null), 2500);
  };

  const encouragingMessages = [
    "You're doing beautifully today",
    "Every small step matters",
    "Your glow is growing",
    "Be gentle with yourself",
    "Progress, not perfection",
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Completion Toast */}
      {completionMessage && (
        <View className="absolute top-20 left-4 right-4 z-50">
          <View className="bg-success/90 px-4 py-3 rounded-softer flex-row items-center justify-center">
            <Sparkles size={18} color="#4A4A4A" />
            <Text className="text-text ml-2 font-medium">{completionMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-2xl font-bold text-text">
            {getGreeting(user?.display_name ?? null)}
          </Text>
          <Text className="text-text-light mt-1">
            {getRandomItem(encouragingMessages)}
          </Text>
        </View>

        {/* Glow Meter */}
        <View className="px-6 mb-6">
          <GlowMeter
            percentage={glowPercentage}
            completedCount={completedCount}
            totalCount={todayHabits.length}
          />
        </View>

        {/* Supplements */}
        <SupplementSection onMessage={handleHabitComplete} />

        {/* Today's Habits */}
        <View className="px-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-text">Today's Rituals</Text>
            <TouchableOpacity
              className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full"
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={16} color={colors.primary} />
              <Text className="text-primary font-medium ml-1">Add</Text>
            </TouchableOpacity>
          </View>

          {todayHabits.length === 0 ? (
            <View className="bg-surface rounded-softer p-8 items-center">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Sparkles size={28} color={colors.primary} />
              </View>
              <Text className="text-text font-semibold text-lg mb-2">
                No habits yet
              </Text>
              <Text className="text-text-light text-center mb-4">
                Start building your glow routine by adding your first habit
              </Text>
              <TouchableOpacity
                className="bg-primary px-6 py-3 rounded-soft"
                onPress={() => setShowCreateModal(true)}
              >
                <Text className="text-white font-medium">Create First Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3">
              {todayHabits.slice(0, 5).map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleHabitComplete}
                />
              ))}
              {todayHabits.length > 5 && (
                <Text className="text-text-light text-center py-2">
                  +{todayHabits.length - 5} more habits
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Quick Stats */}
        {plant && (
          <View className="px-6 mt-8">
            <View className="bg-accent/20 rounded-softer p-4 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-accent/40 items-center justify-center">
                <Text className="text-2xl">🌱</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-text font-medium">Your Glow Plant</Text>
                <Text className="text-text-light capitalize">
                  {plant.growth_stage} • {plant.growth_points} points
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Habit Modal */}
      <CreateHabitModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </SafeAreaView>
  );
}
