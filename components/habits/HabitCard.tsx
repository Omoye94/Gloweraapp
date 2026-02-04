import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Check, MoreVertical } from 'lucide-react-native';
import { Habit, CompletionType } from '../../types';
import { useHabitStore } from '../../stores/habitStore';
import { useAuthStore } from '../../stores/authStore';
import { categoryColors, categoryLabels, colors } from '../../lib/constants';
import { getCompletionMessage, getDailyCompleteMessage } from '../../lib/utils';

interface HabitCardProps {
  habit: Habit;
  onComplete?: (message: string) => void;
}

export default function HabitCard({ habit, onComplete }: HabitCardProps) {
  const { user } = useAuthStore();
  const { completeHabit, uncompleteHabit, isHabitCompletedToday, getTodayHabits, todayCompletions } = useHabitStore();
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const completion = isHabitCompletedToday(habit.id);
  const isCompleted = !!completion;
  const categoryColor = categoryColors[habit.category];

  const handlePress = () => {
    if (isCompleted) {
      // Option to undo
      return;
    }
    setShowCompletionModal(true);
  };

  const handleComplete = async (type: CompletionType) => {
    if (!user?.id || isCompleting) return;

    setIsCompleting(true);
    setShowCompletionModal(false);

    const pointsEarned = await completeHabit(habit.id, user.id, type);

    // Check if this was the last habit
    const todayHabits = getTodayHabits();
    const wasLastHabit = todayCompletions.length + 1 === todayHabits.length;

    const message = wasLastHabit
      ? getDailyCompleteMessage()
      : getCompletionMessage(type);

    onComplete?.(message);
    setIsCompleting(false);
  };

  const handleUndo = async () => {
    if (!completion) return;
    await uncompleteHabit(completion.id);
  };

  return (
    <>
      <TouchableOpacity
        className={`bg-surface rounded-softer p-4 flex-row items-center border-l-4 ${
          isCompleted ? 'opacity-70' : ''
        }`}
        style={{ borderLeftColor: categoryColor }}
        onPress={handlePress}
        onLongPress={isCompleted ? handleUndo : undefined}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${
            isCompleted ? 'bg-primary' : 'border-2 border-primary/30'
          }`}
        >
          {isCompleted && <Check size={18} color="#FFFFFF" strokeWidth={3} />}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text
            className={`font-medium text-base ${
              isCompleted ? 'text-text-light line-through' : 'text-text'
            }`}
          >
            {habit.name}
          </Text>
          <Text className="text-text-light text-sm mt-0.5">
            {categoryLabels[habit.category]}
            {isCompleted && completion && (
              <Text> • Completed {completion.completion_type}</Text>
            )}
          </Text>
        </View>

        {/* Points indicator */}
        {isCompleted && completion && (
          <View className="bg-success/20 px-2 py-1 rounded-full">
            <Text className="text-success text-xs font-medium">
              +{completion.points_earned}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Completion Type Modal */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setShowCompletionModal(false)}
        >
          <View className="bg-surface rounded-t-3xl p-6 pb-10">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

            <Text className="text-xl font-bold text-text text-center mb-2">
              How did it go?
            </Text>
            <Text className="text-text-light text-center mb-6">
              There's no wrong answer - showing up is what matters
            </Text>

            <TouchableOpacity
              className="bg-primary/10 p-5 rounded-softer mb-3"
              onPress={() => handleComplete('gently')}
            >
              <Text className="text-primary font-semibold text-lg">
                Did it gently
              </Text>
              <Text className="text-text-light mt-1">
                A softer version, but you showed up (+5 points)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-primary p-5 rounded-softer"
              onPress={() => handleComplete('fully')}
            >
              <Text className="text-white font-semibold text-lg">
                Did it fully
              </Text>
              <Text className="text-white/80 mt-1">
                Gave it your all today (+10 points)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 p-3"
              onPress={() => setShowCompletionModal(false)}
            >
              <Text className="text-text-light text-center">Not now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
